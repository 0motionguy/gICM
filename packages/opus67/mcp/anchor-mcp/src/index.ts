#!/usr/bin/env node
/**
 * OPUS 67 Anchor MCP Server
 *
 * THE KILLER FEATURE - No competitor has this!
 *
 * Parse Anchor IDLs and generate instructions from natural language.
 * This MCP server enables Claude to:
 * - Load and understand Anchor program IDLs
 * - Generate transaction instructions from natural language
 * - Execute and simulate transactions
 * - Decode account data
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { Connection, PublicKey, Keypair, Transaction, VersionedTransaction } from '@solana/web3.js';
import { Program, AnchorProvider, Idl, BN } from '@coral-xyz/anchor';
import * as fs from 'fs';
import * as path from 'path';

// IDL can have various shapes across Anchor versions - use loose typing
type AnyIdl = Idl & {
  name?: string;
  metadata?: {
    address?: string;
    name?: string;
  };
};
import bs58 from 'bs58';

// =============================================================================
// TYPES
// =============================================================================

interface LoadedIDL {
  name: string;
  programId: string;
  idl: Idl;
  instructions: string[];
  accounts: string[];
}

interface InstructionArg {
  name: string;
  type: string;
  value: unknown;
}

// =============================================================================
// STATE
// =============================================================================

const loadedIDLs: Map<string, LoadedIDL> = new Map();
let connection: Connection | null = null;
let wallet: Keypair | null = null;

// =============================================================================
// HELPERS
// =============================================================================

function getConnection(): Connection {
  if (!connection) {
    const rpcUrl = process.env.RPC_URL || process.env.HELIUS_RPC_URL || 'https://api.devnet.solana.com';
    connection = new Connection(rpcUrl, 'confirmed');
  }
  return connection;
}

function getWallet(): Keypair {
  if (!wallet) {
    const privateKey = process.env.SOLANA_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('SOLANA_PRIVATE_KEY not set');
    }
    // Support both base58 and JSON array formats
    try {
      wallet = Keypair.fromSecretKey(bs58.decode(privateKey));
    } catch {
      wallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(privateKey)));
    }
  }
  return wallet;
}

function parseIdlType(type: unknown): string {
  if (typeof type === 'string') return type;
  if (typeof type === 'object' && type !== null) {
    const t = type as Record<string, unknown>;
    if ('vec' in t) return `Vec<${parseIdlType(t.vec)}>`;
    if ('option' in t) return `Option<${parseIdlType(t.option)}>`;
    if ('array' in t) {
      const arr = t.array as [unknown, number];
      return `[${parseIdlType(arr[0])}; ${arr[1]}]`;
    }
    if ('defined' in t) return t.defined as string;
  }
  return 'unknown';
}

function formatInstructionDocs(idl: Idl, ixName: string): string {
  const ix = idl.instructions?.find((i) => i.name === ixName);
  if (!ix) return 'Instruction not found';

  let docs = `## ${ix.name}\n\n`;

  // Arguments
  if (ix.args && ix.args.length > 0) {
    docs += '### Arguments\n';
    for (const arg of ix.args) {
      docs += `- \`${arg.name}\`: ${parseIdlType(arg.type)}\n`;
    }
    docs += '\n';
  }

  // Accounts
  if (ix.accounts && ix.accounts.length > 0) {
    docs += '### Accounts\n';
    for (const acc of ix.accounts) {
      const acct = acc as { name: string; isMut?: boolean; isSigner?: boolean };
      const flags = [];
      if (acct.isMut) flags.push('mut');
      if (acct.isSigner) flags.push('signer');
      const flagStr = flags.length > 0 ? ` (${flags.join(', ')})` : '';
      docs += `- \`${acct.name}\`${flagStr}\n`;
    }
  }

  return docs;
}

// =============================================================================
// TOOL IMPLEMENTATIONS
// =============================================================================

async function loadIdl(idlPath: string, programId?: string): Promise<LoadedIDL> {
  const fullPath = path.resolve(idlPath);
  const content = fs.readFileSync(fullPath, 'utf-8');
  const idl = JSON.parse(content) as AnyIdl;

  const pid = programId || idl.metadata?.address || '';
  const name = idl.name || idl.metadata?.name || path.basename(idlPath, '.json');

  const loaded: LoadedIDL = {
    name,
    programId: pid,
    idl,
    instructions: idl.instructions?.map((i) => i.name) || [],
    accounts: idl.accounts?.map((a) => a.name) || [],
  };

  loadedIDLs.set(name, loaded);
  return loaded;
}

async function listLoadedIdls(): Promise<LoadedIDL[]> {
  return Array.from(loadedIDLs.values());
}

async function getInstructionInfo(programName: string, instructionName: string): Promise<string> {
  const loaded = loadedIDLs.get(programName);
  if (!loaded) {
    throw new Error(`Program ${programName} not loaded. Use load_idl first.`);
  }
  return formatInstructionDocs(loaded.idl, instructionName);
}

async function generateInstruction(
  programName: string,
  instructionName: string,
  args: InstructionArg[],
  accounts: Record<string, string>
): Promise<{ instruction: string; accounts: string[] }> {
  const loaded = loadedIDLs.get(programName);
  if (!loaded) {
    throw new Error(`Program ${programName} not loaded. Use load_idl first.`);
  }

  const ix = loaded.idl.instructions?.find((i) => i.name === instructionName);
  if (!ix) {
    throw new Error(`Instruction ${instructionName} not found in ${programName}`);
  }

  // Build the instruction data
  const ixArgs: Record<string, unknown> = {};
  for (const arg of args) {
    // Convert string numbers to BN for u64/i64 types
    if (typeof arg.value === 'string' && /^\d+$/.test(arg.value)) {
      ixArgs[arg.name] = new BN(arg.value);
    } else {
      ixArgs[arg.name] = arg.value;
    }
  }

  // Build accounts list
  const accountsList = Object.entries(accounts).map(([name, pubkey]) => ({
    name,
    pubkey: new PublicKey(pubkey),
  }));

  return {
    instruction: JSON.stringify({
      programId: loaded.programId,
      instruction: instructionName,
      args: ixArgs,
      accounts: accountsList,
    }, null, 2),
    accounts: accountsList.map((a) => `${a.name}: ${a.pubkey.toBase58()}`),
  };
}

async function simulateTransaction(
  programName: string,
  instructionName: string,
  args: InstructionArg[],
  accounts: Record<string, string>
): Promise<{ success: boolean; logs: string[]; error?: string }> {
  try {
    const loaded = loadedIDLs.get(programName);
    if (!loaded) {
      throw new Error(`Program ${programName} not loaded`);
    }

    const conn = getConnection();
    const payer = getWallet();

    // Create provider
    const provider = new AnchorProvider(
      conn,
      {
        publicKey: payer.publicKey,
        signTransaction: async (tx) => {
          if (tx instanceof VersionedTransaction) {
            tx.sign([payer]);
          } else {
            tx.partialSign(payer);
          }
          return tx;
        },
        signAllTransactions: async (txs) => {
          return txs.map((tx) => {
            if (tx instanceof VersionedTransaction) {
              tx.sign([payer]);
            } else {
              tx.partialSign(payer);
            }
            return tx;
          });
        },
      },
      { commitment: 'confirmed' }
    );

    // Create program instance with provider - cast to bypass strict typing
    const ProgramClass = Program as any;
    const program = new ProgramClass(loaded.idl, new PublicKey(loaded.programId), provider);

    // Build instruction arguments
    const ixArgs = args.map((arg) => {
      if (typeof arg.value === 'string' && /^\d+$/.test(arg.value)) {
        return new BN(arg.value);
      }
      return arg.value;
    });

    // Build accounts
    const ixAccounts: Record<string, PublicKey> = {};
    for (const [name, pubkey] of Object.entries(accounts)) {
      ixAccounts[name] = new PublicKey(pubkey);
    }

    // Build and simulate transaction
    const ix = await (program.methods as any)[instructionName](...ixArgs)
      .accounts(ixAccounts)
      .instruction();

    const tx = new Transaction().add(ix);
    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;

    const simulation = await conn.simulateTransaction(tx);

    return {
      success: simulation.value.err === null,
      logs: simulation.value.logs || [],
      error: simulation.value.err ? JSON.stringify(simulation.value.err) : undefined,
    };
  } catch (error) {
    return {
      success: false,
      logs: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function getAccountData(
  programName: string,
  accountType: string,
  accountPubkey: string
): Promise<{ data: unknown; lamports: number }> {
  const loaded = loadedIDLs.get(programName);
  if (!loaded) {
    throw new Error(`Program ${programName} not loaded`);
  }

  const conn = getConnection();
  const payer = getWallet();

  const provider = new AnchorProvider(
    conn,
    {
      publicKey: payer.publicKey,
      signTransaction: async (tx) => tx,
      signAllTransactions: async (txs) => txs,
    },
    { commitment: 'confirmed' }
  );

  // Create program instance with provider - cast to bypass strict typing
  const ProgramClass = Program as any;
  const program = new ProgramClass(loaded.idl, new PublicKey(loaded.programId), provider);
  const pubkey = new PublicKey(accountPubkey);

  // Fetch and decode account
  const accountInfo = await conn.getAccountInfo(pubkey);
  if (!accountInfo) {
    throw new Error(`Account ${accountPubkey} not found`);
  }

  // Try to decode using the program's coder
  try {
    const decoded = program.coder.accounts.decode(accountType, accountInfo.data);
    return {
      data: JSON.parse(JSON.stringify(decoded, (_, v) =>
        typeof v === 'bigint' ? v.toString() : v
      )),
      lamports: accountInfo.lamports,
    };
  } catch {
    // Return raw data if decoding fails
    return {
      data: {
        raw: accountInfo.data.toString('base64'),
        owner: accountInfo.owner.toBase58(),
      },
      lamports: accountInfo.lamports,
    };
  }
}

// =============================================================================
// MCP SERVER
// =============================================================================

const server = new Server(
  {
    name: 'opus67-anchor-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
const tools: Tool[] = [
  {
    name: 'load_idl',
    description: 'Load an Anchor IDL from a JSON file. This must be done before using other anchor tools.',
    inputSchema: {
      type: 'object',
      properties: {
        idl_path: {
          type: 'string',
          description: 'Path to the IDL JSON file (e.g., ./target/idl/my_program.json)',
        },
        program_id: {
          type: 'string',
          description: 'Optional program ID override (default: from IDL metadata)',
        },
      },
      required: ['idl_path'],
    },
  },
  {
    name: 'list_idls',
    description: 'List all loaded Anchor IDLs with their instructions and account types.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_instruction_info',
    description: 'Get detailed information about a specific instruction including arguments and required accounts.',
    inputSchema: {
      type: 'object',
      properties: {
        program_name: {
          type: 'string',
          description: 'Name of the loaded program',
        },
        instruction_name: {
          type: 'string',
          description: 'Name of the instruction',
        },
      },
      required: ['program_name', 'instruction_name'],
    },
  },
  {
    name: 'generate_instruction',
    description: 'Generate an Anchor instruction with the specified arguments and accounts.',
    inputSchema: {
      type: 'object',
      properties: {
        program_name: {
          type: 'string',
          description: 'Name of the loaded program',
        },
        instruction_name: {
          type: 'string',
          description: 'Name of the instruction to generate',
        },
        args: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              type: { type: 'string' },
              value: {},
            },
            required: ['name', 'value'],
          },
          description: 'Instruction arguments',
        },
        accounts: {
          type: 'object',
          description: 'Account name to pubkey mapping',
        },
      },
      required: ['program_name', 'instruction_name', 'args', 'accounts'],
    },
  },
  {
    name: 'simulate_transaction',
    description: 'Simulate a transaction without executing it. Returns logs and potential errors.',
    inputSchema: {
      type: 'object',
      properties: {
        program_name: {
          type: 'string',
          description: 'Name of the loaded program',
        },
        instruction_name: {
          type: 'string',
          description: 'Name of the instruction',
        },
        args: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              value: {},
            },
            required: ['name', 'value'],
          },
        },
        accounts: {
          type: 'object',
          description: 'Account name to pubkey mapping',
        },
      },
      required: ['program_name', 'instruction_name', 'args', 'accounts'],
    },
  },
  {
    name: 'get_account_data',
    description: 'Fetch and decode account data using the program IDL.',
    inputSchema: {
      type: 'object',
      properties: {
        program_name: {
          type: 'string',
          description: 'Name of the loaded program',
        },
        account_type: {
          type: 'string',
          description: 'Type of account to decode (from IDL accounts)',
        },
        account_pubkey: {
          type: 'string',
          description: 'Public key of the account to fetch',
        },
      },
      required: ['program_name', 'account_type', 'account_pubkey'],
    },
  },
];

// Handle list tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'load_idl': {
        const result = await loadIdl(
          args?.idl_path as string,
          args?.program_id as string | undefined
        );
        return {
          content: [
            {
              type: 'text',
              text: `Loaded IDL: ${result.name}\nProgram ID: ${result.programId}\nInstructions: ${result.instructions.join(', ')}\nAccounts: ${result.accounts.join(', ')}`,
            },
          ],
        };
      }

      case 'list_idls': {
        const idls = await listLoadedIdls();
        if (idls.length === 0) {
          return {
            content: [{ type: 'text', text: 'No IDLs loaded. Use load_idl first.' }],
          };
        }
        const text = idls
          .map(
            (i) =>
              `## ${i.name}\nProgram: ${i.programId}\nInstructions: ${i.instructions.join(', ')}\nAccounts: ${i.accounts.join(', ')}`
          )
          .join('\n\n');
        return { content: [{ type: 'text', text }] };
      }

      case 'get_instruction_info': {
        const info = await getInstructionInfo(
          args?.program_name as string,
          args?.instruction_name as string
        );
        return { content: [{ type: 'text', text: info }] };
      }

      case 'generate_instruction': {
        const result = await generateInstruction(
          args?.program_name as string,
          args?.instruction_name as string,
          args?.args as InstructionArg[],
          args?.accounts as Record<string, string>
        );
        return {
          content: [
            {
              type: 'text',
              text: `Generated Instruction:\n${result.instruction}\n\nAccounts:\n${result.accounts.join('\n')}`,
            },
          ],
        };
      }

      case 'simulate_transaction': {
        const result = await simulateTransaction(
          args?.program_name as string,
          args?.instruction_name as string,
          args?.args as InstructionArg[],
          args?.accounts as Record<string, string>
        );
        return {
          content: [
            {
              type: 'text',
              text: `Simulation ${result.success ? 'SUCCESS' : 'FAILED'}\n\nLogs:\n${result.logs.join('\n')}${result.error ? `\n\nError: ${result.error}` : ''}`,
            },
          ],
        };
      }

      case 'get_account_data': {
        const result = await getAccountData(
          args?.program_name as string,
          args?.account_type as string,
          args?.account_pubkey as string
        );
        return {
          content: [
            {
              type: 'text',
              text: `Account Data:\n${JSON.stringify(result.data, null, 2)}\n\nLamports: ${result.lamports}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('OPUS 67 Anchor MCP Server running');
}

main().catch(console.error);
