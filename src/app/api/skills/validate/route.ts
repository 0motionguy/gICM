import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import {
  AgentSkillV2Schema,
  SkillMetadataSchema,
  ProgressiveDisclosureSchema,
  CodeExecutionSchema,
  SkillResourcesSchema,
  SkillLevel1Schema,
  SkillLevel2Schema,
  SkillLevel3Schema,
  validateSkillId,
  validateSkillName,
} from "@/types/skill-v2";

// ============================================================================
// Skill Validation API - POST /api/skills/validate
// Validates skill content against Agent Skills v2 schema
// ============================================================================

// Request body schema - accepts partial or full skill
const ValidateRequestSchema = z.object({
  skill: z.unknown(),
  validationType: z
    .enum(["full", "metadata", "level1", "level2", "level3", "quick"])
    .default("full"),
});

// Response types
interface ValidationError {
  path: string;
  message: string;
  code: string;
}

interface ValidationWarning {
  path: string;
  message: string;
  suggestion?: string;
}

interface ValidationResponse {
  valid: boolean;
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
  tokenEstimate?: {
    level1: number;
    level2: number;
    level3: number;
    total: number;
  };
  suggestions?: string[];
}

/**
 * Converts Zod errors to our ValidationError format.
 */
function zodErrorsToValidationErrors(error: ZodError): ValidationError[] {
  return error.errors.map((err) => ({
    path: err.path.join("."),
    message: err.message,
    code: err.code,
  }));
}

/**
 * Generates best practice warnings for a skill.
 */
function generateWarnings(skill: unknown): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if (typeof skill !== "object" || skill === null) {
    return warnings;
  }

  const s = skill as Record<string, unknown>;

  // Check for missing optional but recommended fields
  if (!s.level3) {
    warnings.push({
      path: "level3",
      message: "Level 3 resources are not defined",
      suggestion:
        "Consider adding resources for enhanced functionality (scripts, templates, examples)",
    });
  }

  // Check progressive disclosure configuration
  const disclosure = s.progressiveDisclosure as
    | Record<string, number>
    | undefined;
  if (disclosure) {
    if (disclosure.level2Tokens > 4000) {
      warnings.push({
        path: "progressiveDisclosure.level2Tokens",
        message: "Level 2 tokens exceed recommended limit",
        suggestion:
          "Keep Level 2 instructions under 4000 tokens for optimal loading performance",
      });
    }
  }

  // Check metadata quality
  const level1 = s.level1 as Record<string, unknown> | undefined;
  if (level1) {
    const metadata = level1.metadata as Record<string, unknown> | undefined;
    if (metadata) {
      // Check description length
      const description = metadata.description as string | undefined;
      if (description && description.length < 50) {
        warnings.push({
          path: "level1.metadata.description",
          message: "Description is quite short",
          suggestion:
            "A longer description (50-200 chars) improves skill discovery",
        });
      }

      // Check tags
      const tags = metadata.tags as string[] | undefined;
      if (!tags || tags.length < 3) {
        warnings.push({
          path: "level1.metadata.tags",
          message: "Few tags defined",
          suggestion: "Add 3-5 relevant tags to improve discoverability",
        });
      }

      // Check trigger patterns
      const triggerPatterns = level1.triggerPatterns as string[] | undefined;
      if (!triggerPatterns || triggerPatterns.length < 3) {
        warnings.push({
          path: "level1.triggerPatterns",
          message: "Few trigger patterns defined",
          suggestion:
            "Add more trigger patterns (5-10) for better skill matching",
        });
      }
    }
  }

  // Check code execution security
  const level3 = s.level3 as Record<string, unknown> | undefined;
  if (level3) {
    const codeExec = level3.codeExecution as
      | Record<string, unknown>
      | undefined;
    if (codeExec) {
      if (codeExec.sandbox === false && codeExec.networkAccess === true) {
        warnings.push({
          path: "level3.codeExecution",
          message: "Non-sandboxed execution with network access is high risk",
          suggestion:
            "Consider enabling sandbox mode or disabling network access",
        });
      }
    }
  }

  return warnings;
}

/**
 * Generates improvement suggestions for a skill.
 */
function generateSuggestions(skill: unknown): string[] {
  const suggestions: string[] = [];

  if (typeof skill !== "object" || skill === null) {
    return suggestions;
  }

  const s = skill as Record<string, unknown>;

  // Check for examples in level2
  const level2 = s.level2 as Record<string, unknown> | undefined;
  if (level2 && !level2.examples) {
    suggestions.push(
      "Add examples to Level 2 to help users understand expected input/output"
    );
  }

  // Check for external APIs
  const level3 = s.level3 as Record<string, unknown> | undefined;
  if (level3 && !level3.externalApis) {
    suggestions.push(
      "Consider documenting any external API dependencies in Level 3"
    );
  }

  // Check compatibility
  if (!s.compatibility) {
    suggestions.push(
      "Add compatibility information for better platform/model matching"
    );
  }

  return suggestions;
}

/**
 * Estimates token counts for each level.
 */
function estimateTokens(skill: unknown): {
  level1: number;
  level2: number;
  level3: number;
  total: number;
} {
  if (typeof skill !== "object" || skill === null) {
    return { level1: 0, level2: 0, level3: 0, total: 0 };
  }

  const s = skill as Record<string, unknown>;

  // Rough estimation: ~4 chars per token
  const estimateFromObject = (obj: unknown): number => {
    return Math.ceil(JSON.stringify(obj).length / 4);
  };

  const level1 = s.level1 ? estimateFromObject(s.level1) : 0;
  const level2 = s.level2 ? estimateFromObject(s.level2) : 0;
  const level3 = s.level3 ? estimateFromObject(s.level3) : 0;

  return {
    level1,
    level2,
    level3,
    total: level1 + level2 + level3,
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          valid: false,
          errors: [
            {
              path: "body",
              message: "Invalid JSON in request body",
              code: "invalid_json",
            },
          ],
        } as ValidationResponse,
        { status: 400 }
      );
    }

    // Validate request structure
    const requestResult = ValidateRequestSchema.safeParse(body);
    if (!requestResult.success) {
      return NextResponse.json(
        {
          valid: false,
          errors: zodErrorsToValidationErrors(requestResult.error),
        } as ValidationResponse,
        { status: 400 }
      );
    }

    const { skill, validationType } = requestResult.data;

    // Select schema based on validation type
    let schema: z.ZodType;
    switch (validationType) {
      case "metadata":
        schema = SkillMetadataSchema;
        break;
      case "level1":
        schema = SkillLevel1Schema;
        break;
      case "level2":
        schema = SkillLevel2Schema;
        break;
      case "level3":
        schema = SkillLevel3Schema;
        break;
      case "quick":
        // Quick validation - just check basic structure
        schema = z.object({
          schemaVersion: z.literal("2.0"),
          level1: z.object({
            metadata: z.object({
              skillId: z.string(),
              name: z.string(),
            }),
          }),
        });
        break;
      case "full":
      default:
        schema = AgentSkillV2Schema;
    }

    // Validate against schema
    const validationResult = schema.safeParse(skill);

    if (!validationResult.success) {
      const response: ValidationResponse = {
        valid: false,
        errors: zodErrorsToValidationErrors(validationResult.error),
        warnings: generateWarnings(skill),
        suggestions: generateSuggestions(skill),
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Additional semantic validations for full validation
    const errors: ValidationError[] = [];

    if (validationType === "full" || validationType === "metadata") {
      // Validate skill ID against reserved words
      const skillData = skill as Record<string, unknown>;
      const level1 = skillData.level1 as Record<string, unknown> | undefined;
      const metadata = level1?.metadata as Record<string, string> | undefined;

      if (metadata?.skillId) {
        const idValidation = validateSkillId(metadata.skillId);
        if (!idValidation.valid) {
          errors.push({
            path: "level1.metadata.skillId",
            message: idValidation.error,
            code: "reserved_word",
          });
        }
      }

      if (metadata?.name) {
        const nameValidation = validateSkillName(metadata.name);
        if (!nameValidation.valid) {
          errors.push({
            path: "level1.metadata.name",
            message: nameValidation.error,
            code: "reserved_word",
          });
        }
      }
    }

    if (errors.length > 0) {
      const response: ValidationResponse = {
        valid: false,
        errors,
        warnings: generateWarnings(skill),
        tokenEstimate: estimateTokens(skill),
        suggestions: generateSuggestions(skill),
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Success response
    const response: ValidationResponse = {
      valid: true,
      warnings: generateWarnings(skill),
      tokenEstimate: estimateTokens(skill),
      suggestions: generateSuggestions(skill),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in POST /api/skills/validate:", error);
    return NextResponse.json(
      {
        valid: false,
        errors: [
          {
            path: "server",
            message: "Internal server error",
            code: "internal_error",
          },
        ],
      } as ValidationResponse,
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
