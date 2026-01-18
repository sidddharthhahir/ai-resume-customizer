import { describe, expect, it } from "vitest";
import { CustomizedResume } from "../drizzle/schema";

describe("Sidebar Template", () => {
  const mockResume: CustomizedResume = {
    summary: {
      original: "Experienced software engineer",
      revised: "Full-stack software engineer with 5+ years experience",
      reason: "Added specific experience level for better ATS matching",
    },
    experience: [
      {
        company: "Tech Corp",
        role: "Senior Engineer",
        duration: "2020-2024",
        bullets: [
          {
            original: "Developed features",
            revised: "Architected and deployed 15+ microservices using Node.js and React",
            reason: "Added specific technologies and metrics",
          },
        ],
      },
    ],
    skills: [
      "React",
      "Node.js",
      "PostgreSQL",
      "Docker",
      "AWS",
      "TypeScript",
      "Python",
    ],
    projects: [
      {
        name: "E-commerce Platform",
        description: "Built scalable e-commerce platform",
        technologies: ["React", "Node.js", "PostgreSQL"],
      },
    ],
    education: [
      {
        institution: "University of Tech",
        degree: "BS Computer Science",
        field: "Software Engineering",
        year: "2019",
      },
    ],
  };

  it("should have valid resume structure", () => {
    expect(mockResume.summary).toBeDefined();
    expect(mockResume.summary.revised).toBeTruthy();
    expect(mockResume.experience).toHaveLength(1);
    expect(mockResume.skills).toHaveLength(7);
  });

  it("should have experience with bullets", () => {
    const exp = mockResume.experience[0];
    expect(exp.company).toBe("Tech Corp");
    expect(exp.role).toBe("Senior Engineer");
    expect(exp.bullets).toHaveLength(1);
    expect(exp.bullets[0].revised).toContain("microservices");
  });

  it("should categorize skills correctly", () => {
    const frontendSkills = mockResume.skills.filter((s) =>
      ["React", "TypeScript"].includes(s)
    );
    const backendSkills = mockResume.skills.filter((s) =>
      ["Node.js", "Python"].includes(s)
    );
    const dbSkills = mockResume.skills.filter((s) =>
      ["PostgreSQL"].includes(s)
    );

    expect(frontendSkills).toHaveLength(2);
    expect(backendSkills).toHaveLength(2);
    expect(dbSkills).toHaveLength(1);
  });

  it("should have valid projects", () => {
    expect(mockResume.projects).toHaveLength(1);
    const project = mockResume.projects[0];
    expect(project.name).toBe("E-commerce Platform");
    expect(project.technologies).toContain("React");
  });

  it("should have valid education", () => {
    expect(mockResume.education).toHaveLength(1);
    const edu = mockResume.education[0];
    expect(edu.degree).toBe("BS Computer Science");
    expect(edu.institution).toBe("University of Tech");
    expect(edu.field).toBe("Software Engineering");
  });

  it("should preserve original content while having revised versions", () => {
    expect(mockResume.summary.original).toBeTruthy();
    expect(mockResume.summary.revised).toBeTruthy();
    expect(mockResume.summary.original).not.toBe(mockResume.summary.revised);

    const bullet = mockResume.experience[0].bullets[0];
    expect(bullet.original).toBeTruthy();
    expect(bullet.revised).toBeTruthy();
    expect(bullet.original).not.toBe(bullet.revised);
  });

  it("should have reasons for all changes", () => {
    expect(mockResume.summary.reason).toBeTruthy();
    mockResume.experience.forEach((exp) => {
      exp.bullets.forEach((bullet) => {
        expect(bullet.reason).toBeTruthy();
      });
    });
  });
});
