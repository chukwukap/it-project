import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma";
import bcrypt from "bcryptjs";

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter: pool });

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Clear existing data
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log("✓ Cleared existing data\n");

  // Create users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const adminUser = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@taskify.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const johnDoe = await prisma.user.create({
    data: {
      name: "chukwuka uba",
      email: "john@taskify.com",
      password: hashedPassword,
      role: "MEMBER",
    },
  });

  const janeDoe = await prisma.user.create({
    data: {
      name: "Jane Smith",
      email: "jane@taskify.com",
      password: hashedPassword,
      role: "MEMBER",
    },
  });

  const mikeWilson = await prisma.user.create({
    data: {
      name: "Mike Wilson",
      email: "mike@taskify.com",
      password: hashedPassword,
      role: "MEMBER",
    },
  });

  const sarahBrown = await prisma.user.create({
    data: {
      name: "Sarah Brown",
      email: "sarah@taskify.com",
      password: hashedPassword,
      role: "MEMBER",
    },
  });

  console.log("✓ Created 5 users");
  console.log(`  - admin@taskify.com (Admin)`);
  console.log(`  - john@taskify.com`);
  console.log(`  - jane@taskify.com`);
  console.log(`  - mike@taskify.com`);
  console.log(`  - sarah@taskify.com`);
  console.log(`  Password for all: password123\n`);

  // Create projects
  const webProject = await prisma.project.create({
    data: {
      name: "Website Redesign",
      description:
        "Complete redesign of the company website with modern UI/UX principles",
      color: "#546FFF",
      members: {
        create: [
          { userId: adminUser.id, role: "OWNER" },
          { userId: johnDoe.id, role: "ADMIN" },
          { userId: janeDoe.id, role: "MEMBER" },
        ],
      },
    },
  });

  const mobileProject = await prisma.project.create({
    data: {
      name: "Mobile App Development",
      description: "Native mobile app for iOS and Android platforms",
      color: "#25C78B",
      members: {
        create: [
          { userId: johnDoe.id, role: "OWNER" },
          { userId: mikeWilson.id, role: "MEMBER" },
          { userId: sarahBrown.id, role: "MEMBER" },
        ],
      },
    },
  });

  const apiProject = await prisma.project.create({
    data: {
      name: "API Integration",
      description: "Third-party API integrations and backend services",
      color: "#FFB054",
      members: {
        create: [
          { userId: janeDoe.id, role: "OWNER" },
          { userId: adminUser.id, role: "ADMIN" },
        ],
      },
    },
  });

  const designProject = await prisma.project.create({
    data: {
      name: "Design System",
      description: "Company-wide design system and component library",
      color: "#DB5962",
      members: {
        create: [
          { userId: sarahBrown.id, role: "OWNER" },
          { userId: janeDoe.id, role: "MEMBER" },
        ],
      },
    },
  });

  console.log("✓ Created 4 projects");
  console.log("  - Website Redesign");
  console.log("  - Mobile App Development");
  console.log("  - API Integration");
  console.log("  - Design System\n");

  // Create tasks
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const tasks = await Promise.all([
    // Website Redesign tasks
    prisma.task.create({
      data: {
        title: "Design new homepage layout",
        description:
          "Create wireframes and mockups for the new homepage design following brand guidelines.",
        status: "IN_PROGRESS",
        priority: "HIGH",
        dueDate: tomorrow,
        projectId: webProject.id,
        assigneeId: janeDoe.id,
        creatorId: adminUser.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Implement responsive navigation",
        description:
          "Build mobile-first responsive navigation component with hamburger menu.",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: nextWeek,
        projectId: webProject.id,
        assigneeId: johnDoe.id,
        creatorId: adminUser.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Set up CI/CD pipeline",
        description:
          "Configure GitHub Actions for automated testing and deployment.",
        status: "DONE",
        priority: "HIGH",
        projectId: webProject.id,
        assigneeId: johnDoe.id,
        creatorId: johnDoe.id,
      },
    }),

    // Mobile App tasks
    prisma.task.create({
      data: {
        title: "User authentication flow",
        description:
          "Implement login, registration, and password reset screens with form validation.",
        status: "IN_PROGRESS",
        priority: "URGENT",
        dueDate: yesterday,
        projectId: mobileProject.id,
        assigneeId: mikeWilson.id,
        creatorId: johnDoe.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Push notifications setup",
        description:
          "Configure Firebase Cloud Messaging for push notifications.",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: nextWeek,
        projectId: mobileProject.id,
        assigneeId: sarahBrown.id,
        creatorId: johnDoe.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "App store listing preparation",
        description:
          "Prepare screenshots, descriptions, and metadata for App Store and Play Store.",
        status: "IN_REVIEW",
        priority: "LOW",
        projectId: mobileProject.id,
        assigneeId: sarahBrown.id,
        creatorId: sarahBrown.id,
      },
    }),

    // API Integration tasks
    prisma.task.create({
      data: {
        title: "Payment gateway integration",
        description: "Integrate Stripe payment gateway with webhook handling.",
        status: "IN_PROGRESS",
        priority: "URGENT",
        dueDate: tomorrow,
        projectId: apiProject.id,
        assigneeId: adminUser.id,
        creatorId: janeDoe.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Email service setup",
        description: "Set up SendGrid for transactional emails with templates.",
        status: "TODO",
        priority: "HIGH",
        dueDate: nextWeek,
        projectId: apiProject.id,
        assigneeId: adminUser.id,
        creatorId: janeDoe.id,
      },
    }),

    // Design System tasks
    prisma.task.create({
      data: {
        title: "Button component variants",
        description:
          "Create primary, secondary, ghost, and danger button variants with hover/active states.",
        status: "DONE",
        priority: "MEDIUM",
        projectId: designProject.id,
        assigneeId: janeDoe.id,
        creatorId: sarahBrown.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Form input components",
        description:
          "Build text input, textarea, select, checkbox, and radio components.",
        status: "IN_PROGRESS",
        priority: "HIGH",
        dueDate: tomorrow,
        projectId: designProject.id,
        assigneeId: sarahBrown.id,
        creatorId: sarahBrown.id,
      },
    }),
  ]);

  console.log(`✓ Created ${tasks.length} tasks\n`);

  // Create comments
  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        content: "Looking great! Just a few tweaks needed on the hero section.",
        taskId: tasks[0].id,
        authorId: adminUser.id,
      },
    }),
    prisma.comment.create({
      data: {
        content: "I've updated the wireframes based on your feedback.",
        taskId: tasks[0].id,
        authorId: janeDoe.id,
      },
    }),
    prisma.comment.create({
      data: {
        content:
          "The auth flow is almost complete. Just need to add forgot password.",
        taskId: tasks[3].id,
        authorId: mikeWilson.id,
      },
    }),
    prisma.comment.create({
      data: {
        content:
          "Great progress! Let me know if you need any help with the API.",
        taskId: tasks[3].id,
        authorId: johnDoe.id,
      },
    }),
    prisma.comment.create({
      data: {
        content: "Stripe webhooks are now working in test mode.",
        taskId: tasks[6].id,
        authorId: adminUser.id,
      },
    }),
  ]);

  console.log(`✓ Created ${comments.length} comments\n`);

  console.log("✅ Database seeded successfully!");
  console.log("\n📝 Login credentials:");
  console.log("   Email: admin@taskify.com");
  console.log("   Password: password123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
