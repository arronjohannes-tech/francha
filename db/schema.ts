import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

const id = () => text('id').primaryKey();
const createdAt = () =>
  integer('created_at', { mode: 'timestamp_ms' }).notNull();

export const restaurants = sqliteTable('restaurants', {
  id: id(),
  name: text('name').notNull(),
  address: text('address'),
  timezone: text('timezone').notNull().default('Europe/Berlin'),
  currency: text('currency').notNull().default('EUR'),
  createdAt: createdAt(),
});

export const users = sqliteTable(
  'users',
  {
    id: id(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    passwordHash: text('password_hash'),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
    createdAt: createdAt(),
  },
  (table) => [uniqueIndex('users_email_unique').on(table.email)],
);

export const restaurantUsers = sqliteTable(
  'restaurant_users',
  {
    restaurantId: text('restaurant_id')
      .notNull()
      .references(() => restaurants.id),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    role: text('role', {
      enum: ['owner', 'manager', 'staff', 'kitchen'],
    })
      .notNull()
      .default('staff'),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex('restaurant_users_pk').on(table.restaurantId, table.userId),
  ],
);

export const categories = sqliteTable(
  'categories',
  {
    id: id(),
    restaurantId: text('restaurant_id')
      .notNull()
      .references(() => restaurants.id),
    name: text('name').notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex('categories_restaurant_name_unique').on(
      table.restaurantId,
      table.name,
    ),
  ],
);

export const products = sqliteTable(
  'products',
  {
    id: id(),
    restaurantId: text('restaurant_id')
      .notNull()
      .references(() => restaurants.id),
    categoryId: text('category_id').references(() => categories.id),
    name: text('name').notNull(),
    sellingPriceCents: integer('selling_price_cents').notNull(),
    taxRate: real('tax_rate').notNull().default(19),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
    createdAt: createdAt(),
  },
  (table) => [index('products_restaurant_idx').on(table.restaurantId)],
);

export const ingredients = sqliteTable(
  'ingredients',
  {
    id: id(),
    restaurantId: text('restaurant_id')
      .notNull()
      .references(() => restaurants.id),
    name: text('name').notNull(),
    unit: text('unit').notNull(),
    minimumStock: real('minimum_stock').notNull().default(0),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex('ingredients_restaurant_name_unique').on(
      table.restaurantId,
      table.name,
    ),
  ],
);

export const recipes = sqliteTable(
  'recipes',
  {
    productId: text('product_id')
      .notNull()
      .references(() => products.id),
    ingredientId: text('ingredient_id')
      .notNull()
      .references(() => ingredients.id),
    quantity: real('quantity').notNull(),
  },
  (table) => [
    uniqueIndex('recipes_product_ingredient_unique').on(
      table.productId,
      table.ingredientId,
    ),
  ],
);

export const diningTables = sqliteTable(
  'dining_tables',
  {
    id: id(),
    restaurantId: text('restaurant_id')
      .notNull()
      .references(() => restaurants.id),
    name: text('name').notNull(),
    seats: integer('seats').notNull(),
    status: text('status', {
      enum: ['available', 'occupied', 'reserved', 'out_of_service'],
    })
      .notNull()
      .default('available'),
  },
  (table) => [
    uniqueIndex('dining_tables_restaurant_name_unique').on(
      table.restaurantId,
      table.name,
    ),
  ],
);

export const orders = sqliteTable(
  'orders',
  {
    id: id(),
    restaurantId: text('restaurant_id')
      .notNull()
      .references(() => restaurants.id),
    tableId: text('table_id').references(() => diningTables.id),
    orderNumber: integer('order_number').notNull(),
    status: text('status', {
      enum: ['new', 'preparing', 'ready', 'served', 'paid', 'cancelled'],
    })
      .notNull()
      .default('new'),
    subtotalCents: integer('subtotal_cents').notNull().default(0),
    taxCents: integer('tax_cents').notNull().default(0),
    totalCents: integer('total_cents').notNull().default(0),
    openedAt: integer('opened_at', { mode: 'timestamp_ms' }).notNull(),
    closedAt: integer('closed_at', { mode: 'timestamp_ms' }),
  },
  (table) => [
    uniqueIndex('orders_restaurant_number_unique').on(
      table.restaurantId,
      table.orderNumber,
    ),
    index('orders_restaurant_status_idx').on(table.restaurantId, table.status),
  ],
);

export const orderItems = sqliteTable(
  'order_items',
  {
    id: id(),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id),
    productId: text('product_id').references(() => products.id),
    nameSnapshot: text('name_snapshot').notNull(),
    quantity: integer('quantity').notNull(),
    unitPriceCents: integer('unit_price_cents').notNull(),
    taxRate: real('tax_rate').notNull(),
    status: text('status', {
      enum: ['new', 'preparing', 'ready', 'served', 'cancelled'],
    })
      .notNull()
      .default('new'),
    notes: text('notes'),
  },
  (table) => [index('order_items_order_idx').on(table.orderId)],
);

export const payments = sqliteTable(
  'payments',
  {
    id: id(),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id),
    method: text('method', {
      enum: ['cash', 'card', 'transfer', 'other'],
    }).notNull(),
    amountCents: integer('amount_cents').notNull(),
    paidAt: integer('paid_at', { mode: 'timestamp_ms' }).notNull(),
    reference: text('reference'),
  },
  (table) => [index('payments_order_idx').on(table.orderId)],
);

export const stockMovements = sqliteTable(
  'stock_movements',
  {
    id: id(),
    restaurantId: text('restaurant_id')
      .notNull()
      .references(() => restaurants.id),
    ingredientId: text('ingredient_id')
      .notNull()
      .references(() => ingredients.id),
    type: text('type', {
      enum: ['purchase', 'consumption', 'adjustment', 'waste'],
    }).notNull(),
    quantity: real('quantity').notNull(),
    unitCostCents: integer('unit_cost_cents'),
    reason: text('reason'),
    orderId: text('order_id').references(() => orders.id),
    createdAt: createdAt(),
  },
  (table) => [
    index('stock_movements_ingredient_idx').on(
      table.ingredientId,
      table.createdAt,
    ),
  ],
);

export const staffProfiles = sqliteTable(
  'staff_profiles',
  {
    id: id(),
    restaurantId: text('restaurant_id')
      .notNull()
      .references(() => restaurants.id),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    position: text('position').notNull(),
    hourlyRateCents: integer('hourly_rate_cents').notNull(),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
  },
  (table) => [
    uniqueIndex('staff_profiles_restaurant_user_unique').on(
      table.restaurantId,
      table.userId,
    ),
  ],
);

export const shifts = sqliteTable('shifts', {
  id: id(),
  restaurantId: text('restaurant_id')
    .notNull()
    .references(() => restaurants.id),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  startsAt: integer('starts_at', { mode: 'timestamp_ms' }).notNull(),
  endsAt: integer('ends_at', { mode: 'timestamp_ms' }).notNull(),
  status: text('status', {
    enum: ['planned', 'active', 'completed', 'cancelled'],
  })
    .notNull()
    .default('planned'),
});

export const expenses = sqliteTable('expenses', {
  id: id(),
  restaurantId: text('restaurant_id')
    .notNull()
    .references(() => restaurants.id),
  category: text('category').notNull(),
  amountCents: integer('amount_cents').notNull(),
  taxCents: integer('tax_cents').notNull().default(0),
  description: text('description'),
  occurredOn: integer('occurred_on', { mode: 'timestamp_ms' }).notNull(),
  createdAt: createdAt(),
});

export const merchants = sqliteTable(
  'merchants',
  {
    id: id(),
    companyName: text('company_name').notNull(),
    contactName: text('contact_name').notNull(),
    email: text('email').notNull(),
    vatId: text('vat_id').notNull(),
    phone: text('phone'),
    street: text('street'),
    postalCode: text('postal_code'),
    city: text('city'),
    country: text('country'),
    website: text('website'),
    notes: text('notes'),
    status: text('status', {
      enum: [
        'neu',
        'in_bearbeitung',
        'angelegt',
        'aktiv',
        'gesperrt',
        'obsolet',
      ],
    })
      .notNull()
      .default('neu'),
    createdAt: createdAt(),
    updatedAt: createdAt(),
  },
  (table) => [uniqueIndex('merchants_email_unique').on(table.email)],
);

export const tasks = sqliteTable(
  'tasks',
  {
    id: id(),
    restaurantId: text('restaurant_id')
      .notNull()
      .references(() => restaurants.id),
    title: text('title').notNull(),
    assignedTo: text('assigned_to').references(() => users.id),
    status: text('status', { enum: ['open', 'done', 'cancelled'] })
      .notNull()
      .default('open'),
    dueAt: integer('due_at', { mode: 'timestamp_ms' }),
    createdAt: createdAt(),
  },
  (table) => [
    index('tasks_restaurant_status_idx').on(table.restaurantId, table.status),
  ],
);

export const restaurantsRelations = relations(restaurants, ({ many }) => ({
  members: many(restaurantUsers),
  categories: many(categories),
  products: many(products),
  ingredients: many(ingredients),
  tables: many(diningTables),
  orders: many(orders),
  stockMovements: many(stockMovements),
}));

export const restaurantUsersRelations = relations(
  restaurantUsers,
  ({ one }) => ({
    restaurant: one(restaurants, {
      fields: [restaurantUsers.restaurantId],
      references: [restaurants.id],
    }),
    user: one(users, {
      fields: [restaurantUsers.userId],
      references: [users.id],
    }),
  }),
);

export const productsRelations = relations(products, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [products.restaurantId],
    references: [restaurants.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  recipes: many(recipes),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [orders.restaurantId],
    references: [restaurants.id],
  }),
  table: one(diningTables, {
    fields: [orders.tableId],
    references: [diningTables.id],
  }),
  items: many(orderItems),
  payments: many(payments),
}));
