export const getQuickActions = (role) => {
   const coreActions = [
      {
         title: "View Inventory",
         icon: "📦",
         route: "/inventory",
         description: "Check current stock levels",
         roles: ["staff", "manager", "admin"],
      },
      {
         title: "Sales Transactions",
         icon: "🛒",
         route: "/sales",
         description: "Manage sales orders",
         roles: ["staff", "manager", "admin"],
      },
      {
         title: "View Reports",
         icon: "📊",
         route: "/reports",
         description: "Analytics and insights",
         roles: ["manager", "admin"],
      },
      {
         title: "User Management",
         icon: "👥",
         route: "/users",
         description: "Manage staff accounts",
         roles: ["admin"],
      },
   ];

   const roleSpecificActions = {
      staff: [
         {
            title: "Start Transaction",
            icon: "💰",
            route: "/transaction",
            description: "Create new sale",
         },
         {
            title: "Quick Stock Check",
            icon: "🔍",
            action: "quickCheck",
            description: "Fast item lookup",
         },
      ],
      manager: [
         {
            title: "Low Stock Alert",
            icon: "⚠️",
            route: "/inventory",
            description: "Items need restocking",
         },
      ],
      admin: [
         {
            title: "System Settings",
            icon: "⚙️",
            action: "settings",
            description: "Configure system",
         },
      ],
   };

   const allowedActions = coreActions.filter((action) =>
      action.roles.includes(role)
   );

   const specificActions = roleSpecificActions[role] || [];

   return [...allowedActions, ...specificActions];
};