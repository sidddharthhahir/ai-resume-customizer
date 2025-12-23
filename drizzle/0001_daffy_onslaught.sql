CREATE TABLE `customizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`resumeId` int NOT NULL,
	`jobId` int NOT NULL,
	`matchScore` json NOT NULL,
	`customizedResume` json NOT NULL,
	`coverLetter` text NOT NULL,
	`explanation` json NOT NULL,
	`resumePdfUrl` text,
	`resumeDocxUrl` text,
	`coverLetterPdfUrl` text,
	`coverLetterDocxUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customizations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobDescriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` varchar(255),
	`roleName` varchar(255),
	`description` text NOT NULL,
	`analysis` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `jobDescriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resumes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`originalFileName` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileKey` text NOT NULL,
	`parsedContent` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `resumes_id` PRIMARY KEY(`id`)
);
