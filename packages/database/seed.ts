import { hashSync } from "bcrypt";
import { PrismaClient } from ".";

const prisma = new PrismaClient();

// 生成符合SnowflakeId格式的ID（16-19位纯数字）
function generateSnowflakeId(): string {
  // 生成当前时间戳（13位）
  const timestamp = Date.now();
  // 生成3-6位随机数，补足到16-19位
  const randomPart = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  return `${timestamp}${randomPart}`;
}

async function main() {
  console.log("Seeding...");

  await prisma.user.upsert({
    where: { username: "admin" },
    create: {
      id: "23900561662304251",
      username: "admin",
      password: hashSync("Aa123456", 10),
      role: "Admin",
      avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Muffin",
      email: "admin@example.com",
    },
    update: {},
  });

  const userId = "23900561662304252";
  await prisma.user.upsert({
    where: { username: "user" },
    create: {
      id: "23900561662304252",
      username: "user",
      password: hashSync("Aa123456", 10),
      role: "User",
      avatar: "https://kuizuo.cn/img/logo.png",
      email: "hi@example.cn",
    },
    update: {},
  });

  const todos = ["code", "sleep", "eat"];

  await prisma.todo.deleteMany();

  await prisma.todo.createMany({
    data: todos.map((todo, i) => ({
      id: "2390056166230000" + i,
      userId: userId,
      value: todo,
    })),
  });

  // 清空菜单表
  await prisma.menu.deleteMany();
  console.log("开始创建菜单数据...");

  try {
    // 创建顶级菜单 - 仪表盘
    const dashboardId = generateSnowflakeId();
    const dashboard = await prisma.menu.create({
      data: {
        id: dashboardId,
        name: "dashboard",
        path: "/dashboard",
        icon: "dashboard",
        component: "LAYOUT",
        sort: 1,
        hidden: false,
        status: true,
        permissions: "dashboard:view",
        level: 1,
        path_ids: "[]",
        path_names: "[]",
      },
    });
    console.log("创建仪表盘菜单成功:", dashboard.id);

    // 创建仪表盘子菜单 - 分析页
    await prisma.menu.create({
      data: {
        id: generateSnowflakeId(),
        name: "analysis",
        path: "/dashboard/analysis",
        icon: "smile",
        component: "./dashboard/analysis",
        sort: 1,
        hidden: false,
        status: true,
        permissions: "dashboard:analysis:view",
        parentId: dashboardId,
        level: 2,
        path_ids: JSON.stringify([dashboardId]),
        path_names: JSON.stringify([dashboard.name]),
      },
    });

    // 创建仪表盘子菜单 - 监控页
    await prisma.menu.create({
      data: {
        id: generateSnowflakeId(),
        name: "monitor",
        path: "/dashboard/monitor",
        icon: "smile",
        component: "./dashboard/monitor",
        sort: 2,
        hidden: false,
        status: true,
        permissions: "dashboard:monitor:view",
        parentId: dashboardId,
        level: 2,
        path_ids: JSON.stringify([dashboardId]),
        path_names: JSON.stringify([dashboard.name]),
      },
    });

    // 创建顶级菜单 - 个人账户
    const accountId = generateSnowflakeId();
    const account = await prisma.menu.create({
      data: {
        id: accountId,
        name: "account",
        path: "/account",
        icon: "user",
        component: "LAYOUT",
        sort: 2,
        hidden: false,
        status: true,
        permissions: "account:view",
        level: 1,
        path_ids: "[]",
        path_names: "[]",
      },
    });
    console.log("创建个人账户菜单成功:", account.id);

    // 创建个人账户子菜单 - 个人中心
    await prisma.menu.create({
      data: {
        id: generateSnowflakeId(),
        name: "center",
        path: "/account/center",
        icon: "smile",
        component: "./account/center",
        sort: 1,
        hidden: false,
        status: true,
        permissions: "account:center:view",
        parentId: accountId,
        level: 2,
        path_ids: JSON.stringify([accountId]),
        path_names: JSON.stringify([account.name]),
      },
    });

    // 创建个人账户子菜单 - 个人设置
    await prisma.menu.create({
      data: {
        id: generateSnowflakeId(),
        name: "settings",
        path: "/account/settings",
        icon: "smile",
        component: "./account/settings",
        sort: 2,
        hidden: false,
        status: true,
        permissions: "account:settings:view",
        parentId: accountId,
        level: 2,
        path_ids: JSON.stringify([accountId]),
        path_names: JSON.stringify([account.name]),
      },
    });

    // 创建顶级菜单 - 系统管理
    const systemId = generateSnowflakeId();
    const system = await prisma.menu.create({
      data: {
        id: systemId,
        name: "系统管理",
        path: "/system",
        icon: "setting",
        component: "LAYOUT",
        sort: 3,
        hidden: false,
        status: true,
        permissions: "system:view",
        level: 1,
        path_ids: "[]",
        path_names: "[]",
      },
    });
    console.log("创建系统管理菜单成功:", system.id);

    // 创建系统管理子菜单 - 用户管理
    await prisma.menu.create({
      data: {
        id: generateSnowflakeId(),
        name: "用户管理",
        path: "/system/user",
        icon: "user",
        component: "./user",
        sort: 1,
        hidden: false,
        status: true,
        permissions: "system:user:view",
        parentId: systemId,
        level: 2,
        path_ids: JSON.stringify([systemId]),
        path_names: JSON.stringify([system.name]),
      },
    });

    // 创建系统管理子菜单 - 菜单管理
    await prisma.menu.create({
      data: {
        id: generateSnowflakeId(),
        name: "菜单管理",
        path: "/system/menu",
        icon: "menu",
        component: "./menu",
        sort: 2,
        hidden: false,
        status: true,
        permissions: "system:menu:view",
        parentId: systemId,
        level: 2,
        path_ids: JSON.stringify([systemId]),
        path_names: JSON.stringify([system.name]),
      },
    });

    // 创建顶级菜单 - Todo管理
    await prisma.menu.create({
      data: {
        id: generateSnowflakeId(),
        name: "Todo管理",
        path: "/todo",
        icon: "check-square",
        component: "./todo",
        sort: 4,
        hidden: false,
        status: true,
        permissions: "todo:view",
        level: 1,
        path_ids: "[]",
        path_names: "[]",
      },
    });

    console.log("菜单数据创建完成！");
  } catch (error) {
    console.error("创建菜单数据时出错:", error);
  }

  console.log("Seeding done!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
