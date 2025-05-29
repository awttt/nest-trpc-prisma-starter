import { PrismaClient, Prisma } from '.';
import { hashSync } from 'bcrypt'

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');

  await prisma.user.upsert({
    where: { username: 'admin' },
    create: {
      id: '23900561662304251',
      username: 'admin',
      password: hashSync('Aa123456', 10),
      role: "Admin",
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Muffin',
      email: 'admin@example.com',
    },
    update: {}
  })

  const userId = '23900561662304252'
  await prisma.user.upsert({
    where: { username: 'user' },
    create: {
      id: '23900561662304252',
      username: 'user',
      password: hashSync('Aa123456', 10),
      role: "User",
      avatar: 'https://kuizuo.cn/img/logo.png',
      email: 'hi@example.cn',
    },
    update: {}
  })

  const todos = ['code', 'sleep', 'eat']

  await prisma.todo.deleteMany()

  await prisma.todo.createMany({
    data: todos.map((todo, i) => ({
      id: '2390056166230000' + i,
      userId: userId,
      value: todo
    }))
  })


   await prisma.menu.deleteMany()

  // 创建顶级菜单
  const dashboard = await prisma.menu.create({
    data: {
      name: '仪表盘',
      path: '/dashboard',
      icon: 'DashboardOutlined',
      component: '/dashboard/index',
      sort: 1,
      hidden: false,
      status: true,
      permissions: ['dashboard:view'],
    },
  })

  const system = await prisma.menu.create({
    data: {
      name: '系统管理',
      path: '/system',
      icon: 'SettingOutlined',
      component: 'LAYOUT',
      sort: 100,
      hidden: false,
      status: true,
      permissions: ['system:view'],
    },
  })

  // 创建系统管理的子菜单
  await prisma.menu.createMany({
    data: [
      {
        name: '用户管理',
        path: '/system/user',
        icon: 'UserOutlined',
        component: '/system/user/index',
        sort: 1,
        hidden: false,
        status: true,
        permissions: ['user:view', 'user:create', 'user:edit', 'user:delete'],
        parentId: system.id,
      },
      {
        name: '角色管理',
        path: '/system/role',
        icon: 'TeamOutlined',
        component: '/system/role/index',
        sort: 2,
        hidden: false,
        status: true,
        permissions: ['role:view', 'role:create', 'role:edit', 'role:delete'],
        parentId: system.id,
      },
      {
        name: '菜单管理',
        path: '/system/menu',
        icon: 'MenuOutlined',
        component: '/system/menu/index',
        sort: 3,
        hidden: false,
        status: true,
        permissions: ['menu:view', 'menu:create', 'menu:edit', 'menu:delete'],
        parentId: system.id,
      },
    ],
  })

  console.log('Seeding done!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
