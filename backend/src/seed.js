import "dotenv/config.js";
import mongoose from "mongoose";
import ServiceCategory from "./models/ServiceCategory.js";
import Service from "./models/Service.js";
import Staff from "./models/Staff.js";
import StaffAvailability from "./models/StaffAvailability.js";

await mongoose.connect(process.env.MONGODB_URI);
console.log("Seeding...");

// 1) Category
const cat = await ServiceCategory.create({ name: "Hair", description: "Hair services" });

// 2) Services
const haircut = await Service.create({
  category_id: cat._id,
  name: "Classic Haircut",
  description: "Wash, cut & style",
  duration_minutes: 30,
  base_price: 2000,
  active: true
});

const beard = await Service.create({
  category_id: cat._id,
  name: "Beard Trim",
  description: "Shape & finish",
  duration_minutes: 20,
  base_price: 1500,
  active: true
});

// 3) Staff
const sara = await Staff.create({
  name: "Sara Khan",
  title: "Stylist",
  active: true,
  service_ids: [haircut._id, beard._id]
});
const ali = await Staff.create({
  name: "Ali Raza",
  title: "Barber",
  active: true,
  service_ids: [haircut._id]
});

// 4) Availability (Mon–Fri 10:00–18:00, break 13:00–14:00)
const weekdays = [1,2,3,4,5]; // Mon..Fri
const mkAvail = (staff_id) => weekdays.map(w => ({
  staff_id, weekday: w, start_time: "10:00", end_time: "18:00",
  breaks: [{ start: "13:00", end: "14:00" }]
}));
await StaffAvailability.insertMany([
  ...mkAvail(sara._id),
  ...mkAvail(ali._id)
]);

console.log("Seeded IDs:");
console.log({ haircut: haircut._id.toString(), beard: beard._id.toString(), sara: sara._id.toString(), ali: ali._id.toString() });

await mongoose.disconnect();
process.exit(0);
