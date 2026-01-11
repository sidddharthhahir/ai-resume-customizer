CREATE TABLE `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`customizationId` int NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`roleName` varchar(255) NOT NULL,
	`status` enum('applied','interview','offer','rejected','withdrawn') NOT NULL DEFAULT 'applied',
	`appliedDate` timestamp NOT NULL DEFAULT (now()),
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`notes` text,
	`interviewDate` timestamp,
	`outcome` text,
	`matchScore` int,
	`atsScore` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
