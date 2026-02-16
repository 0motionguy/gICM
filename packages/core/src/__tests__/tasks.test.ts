import { describe, it, expect, beforeEach } from "vitest";
import {
  createTask,
  assignTask,
  updateTaskStatus,
  getTasksByAgent,
  getTask,
  clearTasks,
  type Priority,
  type TaskStatus,
} from "../tasks";

describe("Task Router", () => {
  beforeEach(() => {
    clearTasks();
  });

  describe("createTask", () => {
    it("should create a task and return ID", async () => {
      const taskId = await createTask(
        "P1",
        "orchestrator",
        "Test task",
        "Task details"
      );
      expect(taskId).toBeDefined();
      expect(typeof taskId).toBe("string");
    });

    it("should store task with correct properties", async () => {
      const taskId = await createTask(
        "P0",
        "wallet-agent",
        "Critical task",
        "Important details"
      );
      const task = getTask(taskId);

      expect(task).toBeDefined();
      expect(task?.priority).toBe("P0");
      expect(task?.agent).toBe("wallet-agent");
      expect(task?.title).toBe("Critical task");
      expect(task?.details).toBe("Important details");
      expect(task?.status).toBe("pending");
      expect(task?.createdAt).toBeDefined();
      expect(task?.updatedAt).toBeDefined();
    });

    it("should throw on empty agent", async () => {
      await expect(createTask("P1", "", "Title", "Details")).rejects.toThrow(
        "Agent must be a non-empty string"
      );
    });

    it("should throw on empty title", async () => {
      await expect(createTask("P1", "agent", "", "Details")).rejects.toThrow(
        "Title must be a non-empty string"
      );
    });

    it("should throw on invalid priority", async () => {
      await expect(
        createTask("P5" as Priority, "agent", "Title", "Details")
      ).rejects.toThrow("Priority must be P0, P1, P2, or P3");
    });

    it("should accept all valid priorities", async () => {
      const priorities: Priority[] = ["P0", "P1", "P2", "P3"];
      for (const p of priorities) {
        const id = await createTask(p, "agent", `${p} task`, "Details");
        const task = getTask(id);
        expect(task?.priority).toBe(p);
      }
    });
  });

  describe("assignTask", () => {
    it("should reassign task to new agent", async () => {
      const taskId = await createTask(
        "P1",
        "original-agent",
        "Task",
        "Details"
      );
      await assignTask(taskId, "new-agent");

      const task = getTask(taskId);
      expect(task?.agent).toBe("new-agent");
    });

    it("should update updatedAt timestamp", async () => {
      const taskId = await createTask("P1", "agent", "Task", "Details");
      const before = getTask(taskId)?.updatedAt;

      await new Promise((r) => setTimeout(r, 10));
      await assignTask(taskId, "other-agent");

      const after = getTask(taskId)?.updatedAt;
      expect(after).not.toBe(before);
    });

    it("should throw on non-existent task", async () => {
      await expect(assignTask("fake-id", "agent")).rejects.toThrow(
        "Task not found: fake-id"
      );
    });

    it("should throw on empty agent", async () => {
      const taskId = await createTask("P1", "agent", "Task", "Details");
      await expect(assignTask(taskId, "")).rejects.toThrow(
        "Agent must be a non-empty string"
      );
    });
  });

  describe("updateTaskStatus", () => {
    it("should update task status", async () => {
      const taskId = await createTask("P1", "agent", "Task", "Details");

      await updateTaskStatus(taskId, "active");
      expect(getTask(taskId)?.status).toBe("active");

      await updateTaskStatus(taskId, "completed");
      expect(getTask(taskId)?.status).toBe("completed");
    });

    it("should accept all valid statuses", async () => {
      const statuses: TaskStatus[] = [
        "pending",
        "active",
        "completed",
        "failed",
      ];

      for (const status of statuses) {
        const taskId = await createTask("P1", "agent", "Task", "Details");
        await updateTaskStatus(taskId, status);
        expect(getTask(taskId)?.status).toBe(status);
      }
    });

    it("should throw on invalid status", async () => {
      const taskId = await createTask("P1", "agent", "Task", "Details");
      await expect(
        updateTaskStatus(taskId, "invalid" as TaskStatus)
      ).rejects.toThrow("Status must be pending, active, completed, or failed");
    });

    it("should throw on non-existent task", async () => {
      await expect(updateTaskStatus("fake-id", "active")).rejects.toThrow(
        "Task not found: fake-id"
      );
    });
  });

  describe("getTasksByAgent", () => {
    it("should return tasks for specific agent", async () => {
      await createTask("P1", "agent-a", "Task 1", "Details");
      await createTask("P2", "agent-b", "Task 2", "Details");
      await createTask("P0", "agent-a", "Task 3", "Details");

      const tasksA = await getTasksByAgent("agent-a");
      const tasksB = await getTasksByAgent("agent-b");

      expect(tasksA.length).toBe(2);
      expect(tasksB.length).toBe(1);
    });

    it("should filter by status", async () => {
      const id1 = await createTask("P1", "agent", "Task 1", "Details");
      await createTask("P2", "agent", "Task 2", "Details");
      await updateTaskStatus(id1, "completed");

      const pending = await getTasksByAgent("agent", "pending");
      const completed = await getTasksByAgent("agent", "completed");

      expect(pending.length).toBe(1);
      expect(completed.length).toBe(1);
    });

    it("should sort by priority (P0 first)", async () => {
      await createTask("P3", "agent", "Low priority", "Details");
      await createTask("P0", "agent", "Critical", "Details");
      await createTask("P2", "agent", "Medium", "Details");
      await createTask("P1", "agent", "High", "Details");

      const tasks = await getTasksByAgent("agent");

      expect(tasks[0].priority).toBe("P0");
      expect(tasks[1].priority).toBe("P1");
      expect(tasks[2].priority).toBe("P2");
      expect(tasks[3].priority).toBe("P3");
    });

    it("should return empty array for unknown agent", async () => {
      const tasks = await getTasksByAgent("unknown");
      expect(tasks).toEqual([]);
    });

    it("should throw on empty agent", async () => {
      await expect(getTasksByAgent("")).rejects.toThrow(
        "Agent must be a non-empty string"
      );
    });

    it("should return copies of tasks", async () => {
      const taskId = await createTask("P1", "agent", "Task", "Details");
      const tasks = await getTasksByAgent("agent");

      tasks[0].title = "Modified";
      const original = getTask(taskId);

      expect(original?.title).toBe("Task");
    });
  });

  describe("getTask", () => {
    it("should return task by ID", async () => {
      const taskId = await createTask("P1", "agent", "Task", "Details");
      const task = getTask(taskId);

      expect(task).toBeDefined();
      expect(task?.id).toBe(taskId);
    });

    it("should return undefined for non-existent task", () => {
      const task = getTask("non-existent");
      expect(task).toBeUndefined();
    });

    it("should return a copy of the task", async () => {
      const taskId = await createTask("P1", "agent", "Task", "Details");
      const task = getTask(taskId);

      if (task) {
        task.title = "Modified";
      }

      const original = getTask(taskId);
      expect(original?.title).toBe("Task");
    });
  });

  describe("clearTasks", () => {
    it("should remove all tasks", async () => {
      await createTask("P1", "agent", "Task 1", "Details");
      await createTask("P2", "agent", "Task 2", "Details");

      clearTasks();

      const tasks = await getTasksByAgent("agent");
      expect(tasks.length).toBe(0);
    });
  });
});
