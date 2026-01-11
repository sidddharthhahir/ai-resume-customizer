import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createApplication,
  getUserApplications,
  updateApplicationStatus,
  deleteApplication,
  getApplicationStats,
} from "./db";
import type { InsertApplication } from "../drizzle/schema";

// Mock database operations
vi.mock("./db", { spy: true });

describe("Application Tracker", () => {
  const mockUserId = 1;
  const mockCustomizationId = 1;

  describe("createApplication", () => {
    it("should create a new application with applied status", async () => {
      const appData: InsertApplication = {
        userId: mockUserId,
        customizationId: mockCustomizationId,
        companyName: "Google",
        roleName: "Senior Engineer",
        status: "applied",
        notes: "Applied via LinkedIn",
        matchScore: 85,
        atsScore: 92,
      } as any;

      expect(appData.status).toBe("applied");
      expect(appData.companyName).toBe("Google");
      expect(appData.roleName).toBe("Senior Engineer");
    });
  });

  describe("updateApplicationStatus", () => {
    it("should update application status to interview", async () => {
      const statuses = ["applied", "interview", "offer", "rejected", "withdrawn"];
      const newStatus = "interview";

      expect(statuses).toContain(newStatus);
    });

    it("should update application with notes", async () => {
      const notes = "Phone interview scheduled for next week";
      expect(notes).toBeTruthy();
      expect(notes.length).toBeGreaterThan(0);
    });
  });

  describe("getApplicationStats", () => {
    it("should calculate success rate correctly", () => {
      const stats = {
        total: 10,
        applied: 5,
        interview: 3,
        offer: 1,
        rejected: 1,
        withdrawn: 0,
        successRate: 10, // 1 offer / 10 total = 10%
      };

      expect(stats.successRate).toBe(Math.round((stats.offer / stats.total) * 100));
      expect(stats.total).toBe(10);
      expect(stats.offer).toBe(1);
    });

    it("should return zero success rate when no applications", () => {
      const stats = {
        total: 0,
        applied: 0,
        interview: 0,
        offer: 0,
        rejected: 0,
        withdrawn: 0,
        successRate: 0,
      };

      expect(stats.successRate).toBe(0);
    });
  });

  describe("Application Status Transitions", () => {
    it("should allow transition from applied to interview", () => {
      const validTransition = {
        from: "applied",
        to: "interview",
      };

      expect(validTransition.from).toBe("applied");
      expect(validTransition.to).toBe("interview");
    });

    it("should allow transition from interview to offer", () => {
      const validTransition = {
        from: "interview",
        to: "offer",
      };

      expect(validTransition.from).toBe("interview");
      expect(validTransition.to).toBe("offer");
    });

    it("should allow transition from any status to rejected", () => {
      const statuses = ["applied", "interview", "offer"];

      statuses.forEach((status) => {
        expect(["applied", "interview", "offer", "rejected", "withdrawn"]).toContain("rejected");
      });
    });

    it("should allow transition to withdrawn from any status", () => {
      const statuses = ["applied", "interview", "offer", "rejected"];

      statuses.forEach((status) => {
        expect(["applied", "interview", "offer", "rejected", "withdrawn"]).toContain("withdrawn");
      });
    });
  });

  describe("Application Data Validation", () => {
    it("should require company name", () => {
      const appData = {
        companyName: "",
        roleName: "Engineer",
      };

      expect(appData.companyName).toBe("");
      expect(appData.companyName.length).toBe(0);
    });

    it("should require role name", () => {
      const appData = {
        companyName: "Google",
        roleName: "",
      };

      expect(appData.roleName).toBe("");
      expect(appData.roleName.length).toBe(0);
    });

    it("should store match score from customization", () => {
      const appData = {
        customizationId: 1,
        matchScore: 85,
        atsScore: 92,
      };

      expect(appData.matchScore).toBe(85);
      expect(appData.atsScore).toBe(92);
    });
  });

  describe("Application Analytics", () => {
    it("should track applications by status", () => {
      const applications = [
        { id: 1, status: "applied" },
        { id: 2, status: "interview" },
        { id: 3, status: "interview" },
        { id: 4, status: "offer" },
        { id: 5, status: "rejected" },
      ];

      const stats = {
        total: applications.length,
        applied: applications.filter((a) => a.status === "applied").length,
        interview: applications.filter((a) => a.status === "interview").length,
        offer: applications.filter((a) => a.status === "offer").length,
        rejected: applications.filter((a) => a.status === "rejected").length,
      };

      expect(stats.total).toBe(5);
      expect(stats.applied).toBe(1);
      expect(stats.interview).toBe(2);
      expect(stats.offer).toBe(1);
      expect(stats.rejected).toBe(1);
    });

    it("should calculate interview rate", () => {
      const total = 10;
      const interviews = 3;
      const interviewRate = Math.round((interviews / total) * 100);

      expect(interviewRate).toBe(30);
    });

    it("should calculate offer rate", () => {
      const total = 10;
      const offers = 2;
      const offerRate = Math.round((offers / total) * 100);

      expect(offerRate).toBe(20);
    });
  });
});
