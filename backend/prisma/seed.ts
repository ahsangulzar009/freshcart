import { ProductCategory } from "./generated/prisma/client";
import {prisma } from '../src/config/prisma'


const products = [
  // ---------------- FRUITS ----------------
  {
    name: "Fresh Apples",
    description: "Crisp and juicy red apples, perfect for snacking",
    category: ProductCategory.FRUITS,
    price: 120,
    unit: 'kg',
    stock: 100,
    isFeatured: true,
    imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400"
  },
  {
    name: "Bananas",
    description: "Fresh ripe bananas, rich in potassium",
    category: ProductCategory.FRUITS,
    price: 40,
    unit: 'dozen',
    stock: 150,
    isFeatured: true,
    imageUrl: "https://images.unsplash.com/photo-1640958900081-7b069dd23e9c?w=400"
  },
  {
    name: "Alphonso Mangoes",
    description: "Premium Alphonso mangoes from Ratnagiri",
    category: ProductCategory.FRUITS,
    price: 350,
    unit: 'kg',
    stock: 60,
    isFeatured: true,
    imageUrl: "https://images.unsplash.com/photo-1519096845289-95806ee03a1a?w=400"
  },
  {
    name: "Watermelon",
    description: "Sweet and refreshing watermelon",
    category: ProductCategory.FRUITS,
    price: 30,
    unit: 'kg',
    stock: 40,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400"
  },
  {
    name: "Grapes",
    description: "Seedless green grapes, fresh from the farm",
    category: ProductCategory.FRUITS,
    price: 80,
    unit: '500g',
    stock: 80,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400"
  },
  {
    name: "Oranges",
    description: "Juicy Nagpur oranges packed with vitamin C",
    category: ProductCategory.FRUITS,
    price: 60,
    unit: 'kg',
    stock: 90,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=400"
  },
  {
    name: "Strawberries",
    description: "Fresh red strawberries, tangy and sweet",
    category: ProductCategory.FRUITS,
    price: 600,
    unit: 'kg',
    stock: 40,
    isFeatured: true,
    imageUrl: "https://images.unsplash.com/photo-1594282241894-4da286138f44?w=400"
  },
  {
    name: "Pomegranate",
    description: "Ruby red pomegranates with juicy seeds",
    category: ProductCategory.FRUITS,
    price: 420,
    unit: 'kg',
    stock: 55,
    isFeatured: false,
    imageUrl: "https://plus.unsplash.com/premium_photo-1668076515507-c5bc223c99a4?w=400"
  },
  {
    name: "Guava",
    description: "Fresh local guavas, soft and aromatic",
    category: ProductCategory.FRUITS,
    price: 200,
    unit: 'kg',
    stock: 90,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1629367308496-a2496ba22f88?w=400"
  },
  {
    name: "Pineapple",
    description: "Tropical pineapple, sweet with a tangy bite",
    category: ProductCategory.FRUITS,
    price: 280,
    unit: 'piece',
    stock: 45,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=400"
  },
  {
    name: "Papaya",
    description: "Ripe papaya, soft and naturally sweet",
    category: ProductCategory.FRUITS,
    price: 150,
    unit: 'kg',
    stock: 50,
    isFeatured: false,
    imageUrl: "https://plus.unsplash.com/premium_photo-1664391808687-55acdf5c7317?w=400"
  },
  {
    name: "Peaches",
    description: "Soft juicy peaches with a sweet aroma",
    category: ProductCategory.FRUITS,
    price: 350,
    unit: 'kg',
    stock: 45,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1639588473831-dd9d014646ae?w=400"
  },
  {
    name: "Plums",
    description: "Tangy sweet plums, fresh and juicy",
    category: ProductCategory.FRUITS,
    price: 300,
    unit: 'kg',
    stock: 50,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1787174314278-3b3639200e0b?w=400"
  },
  {
    name: "Pears",
    description: "Crisp and sweet pears",
    category: ProductCategory.FRUITS,
    price: 280,
    unit: 'kg',
    stock: 60,
    isFeatured: false,
    imageUrl: "https://plus.unsplash.com/premium_photo-1667927478003-e7c3a1fcde1d?w=400"
  },
  {
    name: "Kiwi",
    description: "Tangy green kiwi fruit, rich in vitamin C",
    category: ProductCategory.FRUITS,
    price: 500,
    unit: 'kg',
    stock: 35,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1616684000067-36952fde56ec?w=400"
  },
  {
    name: "Lychee",
    description: "Sweet and juicy fresh lychees",
    category: ProductCategory.FRUITS,
    price: 550,
    unit: 'kg',
    stock: 30,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1674041533747-17ad0049acd1?w=400"
  },
  {
    name: "Dates",
    description: "Soft sweet dates, a natural energy booster",
    category: ProductCategory.FRUITS,
    price: 700,
    unit: 'kg',
    stock: 70,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1771231591559-d19c89ad118a?w=400"
  },
  {
    name: "Lemons",
    description: "Fresh tangy lemons for drinks and cooking",
    category: ProductCategory.FRUITS,
    price: 160,
    unit: 'kg',
    stock: 100,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1770617476023-0afb8155d9a1?w=400"
  },
  {
    name: "Melon",
    description: "Sweet and fragrant melon",
    category: ProductCategory.FRUITS,
    price: 120,
    unit: 'kg',
    stock: 55,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1563288525-8f1ee0f874a8?w=400"
  },
  {
    name: "Coconut",
    description: "Fresh coconut with sweet water inside",
    category: ProductCategory.FRUITS,
    price: 130,
    unit: 'piece',
    stock: 65,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1580984969071-a8da5656c2fb?w=400"
  },

  // ---------------- VEGETABLES ----------------
  {
    name: "Tomatoes",
    description: "Farm fresh red tomatoes for salads and cooking",
    category: ProductCategory.VEGETABLES,
    price: 120,
    unit: 'kg',
    stock: 200,
    isFeatured: true,
    imageUrl: "https://images.unsplash.com/photo-1524593166156-312f362cada0?w=400"
  },
  {
    name: "Potatoes",
    description: "Versatile potatoes for fries, curries and more",
    category: ProductCategory.VEGETABLES,
    price: 80,
    unit: 'kg',
    stock: 300,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400"
  },
  {
    name: "Onions",
    description: "Fresh onions, a kitchen essential",
    category: ProductCategory.VEGETABLES,
    price: 100,
    unit: 'kg',
    stock: 250,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=400"
  },
  {
    name: "Carrots",
    description: "Crunchy sweet carrots, great raw or cooked",
    category: ProductCategory.VEGETABLES,
    price: 110,
    unit: 'kg',
    stock: 140,
    isFeatured: true,
    imageUrl: "https://images.unsplash.com/photo-1763534315367-db5fe9c0dc79?w=400"
  },
  {
    name: "Spinach",
    description: "Tender green spinach leaves, rich in iron",
    category: ProductCategory.VEGETABLES,
    price: 60,
    unit: 'bunch',
    stock: 100,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1683536905403-ea18a3176d29?w=400"
  },
  {
    name: "Cauliflower",
    description: "Fresh white cauliflower heads",
    category: ProductCategory.VEGETABLES,
    price: 130,
    unit: 'kg',
    stock: 90,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1692956706779-576c151ec712?w=400"
  },
  {
    name: "Cucumber",
    description: "Cool and crisp cucumbers for salads",
    category: ProductCategory.VEGETABLES,
    price: 90,
    unit: 'kg',
    stock: 130,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400"
  },
  {
    name: "Green Capsicum",
    description: "Crunchy green bell peppers",
    category: ProductCategory.VEGETABLES,
    price: 220,
    unit: 'kg',
    stock: 75,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1622376242797-538aa64a9d38?w=400"
  },
  {
    name: "Garlic",
    description: "Aromatic garlic bulbs for flavor",
    category: ProductCategory.VEGETABLES,
    price: 400,
    unit: 'kg',
    stock: 60,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=400"
  },
  {
    name: "Green Peas",
    description: "Sweet fresh green peas in pods",
    category: ProductCategory.VEGETABLES,
    price: 240,
    unit: 'kg',
    stock: 80,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1690023852149-0c69ac74734f?w=400"
  },
  {
    name: "Cabbage",
    description: "Fresh green cabbage, crisp and leafy",
    category: ProductCategory.VEGETABLES,
    price: 70,
    unit: 'kg',
    stock: 110,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1652860213441-6622f9fec77f?w=400"
  },
  {
    name: "Broccoli",
    description: "Fresh green broccoli, rich in vitamins",
    category: ProductCategory.VEGETABLES,
    price: 260,
    unit: 'kg',
    stock: 60,
    isFeatured: false,
    imageUrl: "https://plus.unsplash.com/premium_photo-1724250161295-ccb9c5f4f63d?w=400"
  },
  {
    name: "Okra",
    description: "Tender okra (bhindi), perfect for curries",
    category: ProductCategory.VEGETABLES,
    price: 180,
    unit: 'kg',
    stock: 85,
    isFeatured: false,
    imageUrl: "https://plus.unsplash.com/premium_photo-1666877059056-f42ada662ccc?w=400"
  },
  {
    name: "Eggplant",
    description: "Glossy purple eggplant (baingan)",
    category: ProductCategory.VEGETABLES,
    price: 110,
    unit: 'kg',
    stock: 90,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1604245437608-50c6bb8d4ee5?w=400"
  },
  {
    name: "Green Chilies",
    description: "Fresh hot green chilies",
    category: ProductCategory.VEGETABLES,
    price: 200,
    unit: 'kg',
    stock: 70,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1693664132235-1b7050b45da5?w=400"
  },
  {
    name: "Ginger",
    description: "Fresh ginger root with a strong aroma",
    category: ProductCategory.VEGETABLES,
    price: 450,
    unit: 'kg',
    stock: 55,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1615484478243-c94e896edbae?w=400"
  },
  {
    name: "Radish",
    description: "Crisp white radish (mooli)",
    category: ProductCategory.VEGETABLES,
    price: 60,
    unit: 'kg',
    stock: 80,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1585369496178-144fd937f249?w=400"
  },
  {
    name: "Bottle Gourd",
    description: "Fresh bottle gourd (lauki), light and healthy",
    category: ProductCategory.VEGETABLES,
    price: 90,
    unit: 'kg',
    stock: 75,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1791139899669-a25269ea258b?w=400"
  },
  {
    name: "Pumpkin",
    description: "Sweet orange pumpkin (kaddu)",
    category: ProductCategory.VEGETABLES,
    price: 100,
    unit: 'kg',
    stock: 65,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1538843586417-c6a03b5230ff?w=400"
  },
  {
    name: "Coriander",
    description: "Fresh coriander leaves (dhania)",
    category: ProductCategory.VEGETABLES,
    price: 40,
    unit: 'bunch',
    stock: 120,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1535189487909-a262ad10c165?w=400"
  },

  // ---------------- MEAT ----------------
  {
    name: "Chicken Breast",
    description: "Boneless skinless chicken breast, lean and tender",
    category: ProductCategory.MEAT,
    price: 650,
    unit: 'kg',
    stock: 50,
    isFeatured: true,
    imageUrl: "https://images.unsplash.com/photo-1682991136736-a2b44623eeba?w=400"
  },
  {
    name: "Whole Chicken",
    description: "Fresh whole chicken, cleaned and ready to cook",
    category: ProductCategory.MEAT,
    price: 480,
    unit: 'kg',
    stock: 60,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400"
  },
  {
    name: "Chicken Drumsticks",
    description: "Juicy chicken drumsticks, great for grilling",
    category: ProductCategory.MEAT,
    price: 520,
    unit: 'kg',
    stock: 45,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1656412665049-52e33e42b9a6?w=400"
  },
  {
    name: "Chicken Boneless",
    description: "Boneless chicken cubes for karahi and tikka",
    category: ProductCategory.MEAT,
    price: 700,
    unit: 'kg',
    stock: 45,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1642497394469-188b0f4bcae6?w=400"
  },
  {
    name: "Beef Mince",
    description: "Fresh minced beef for kebabs and burgers",
    category: ProductCategory.MEAT,
    price: 1100,
    unit: 'kg',
    stock: 40,
    isFeatured: true,
    imageUrl: "https://images.unsplash.com/photo-1546010361-3b7b468209e3?w=400"
  },
  {
    name: "Beef Boneless",
    description: "Premium boneless beef cuts for curries and steaks",
    category: ProductCategory.MEAT,
    price: 1400,
    unit: 'kg',
    stock: 35,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1723893905879-0e309c2a8e06?w=400"
  },
  {
    name: "Beef Ribs",
    description: "Meaty beef ribs, perfect for slow cooking",
    category: ProductCategory.MEAT,
    price: 1250,
    unit: 'kg',
    stock: 30,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400"
  },
  {
    name: "Beef Steak",
    description: "Tender beef steak cuts for grilling",
    category: ProductCategory.MEAT,
    price: 1800,
    unit: 'kg',
    stock: 25,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1632154023554-c2975e9be348?w=400"
  },
  {
    name: "Mutton",
    description: "Fresh mutton with bone, ideal for karahi",
    category: ProductCategory.MEAT,
    price: 2200,
    unit: 'kg',
    stock: 25,
    isFeatured: true,
    imageUrl: "https://images.unsplash.com/photo-1611059263765-f57653f3bba3?w=400"
  },
  {
    name: "Mutton Chops",
    description: "Tender mutton chops for BBQ and grilling",
    category: ProductCategory.MEAT,
    price: 2600,
    unit: 'kg',
    stock: 20,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1595356161904-6708c97be89c?w=400"
  },
  {
    name: "Mutton Mince",
    description: "Fresh minced mutton for kebabs",
    category: ProductCategory.MEAT,
    price: 2300,
    unit: 'kg',
    stock: 20,
    isFeatured: false,
    imageUrl: "https://plus.unsplash.com/premium_photo-1713082862800-b5cf38ae7c6c?w=400"
  },
  {
    name: "Fish Fillet",
    description: "Boneless fresh fish fillets",
    category: ProductCategory.MEAT,
    price: 950,
    unit: 'kg',
    stock: 30,
    isFeatured: false,
    imageUrl: "https://plus.unsplash.com/premium_photo-1757293933078-b7d14d59a1d4?w=400"
  },
  {
    name: "Eggs",
    description: "Farm fresh eggs",
    category: ProductCategory.MEAT,
    price: 360,
    unit: 'dozen',
    stock: 200,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1787943158167-ba2081cbf24d?w=400"
  },
];

async function main() {
  console.log("Seeding database...")

  await prisma.product.deleteMany();

  const result = await prisma.product.createMany({
    data: products,
  });

  console.log(`✅ Seeded ${result.count} products`);
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

