// Sample inventory — placeholder data carried over from the design mockup.
// Swap this array for a real feed (or hand-edit it) when live inventory is ready.
// `photo` is just the placeholder caption shown in the image slot until real photos are dropped in.
window.VEHICLES = [
  { id: "veh-1", year: 2016, make: "Chevrolet", model: "Equinox", trim: "LT", miles: 92400, trans: "Automatic", drive: "AWD", price: 9995, badge: "Just in", type: "SUV", stock: "DA-1031", engine: "2.4L I4", exterior: "Silver Ice Metallic", interior: "Black cloth" },
  { id: "veh-2", year: 2014, make: "Ford", model: "F-150", trim: "XLT SuperCrew", miles: 118200, trans: "6-speed automatic", drive: "4x4", price: 14900, badge: "4x4", type: "Truck", stock: "DA-1042", engine: "5.0L V8", exterior: "Oxford White", interior: "Gray cloth", cab: "SuperCrew, 5.5' bed" },
  { id: "veh-3", year: 2017, make: "Honda", model: "Civic", trim: "LX", miles: 88100, trans: "Automatic", drive: "FWD", price: 12495, badge: "One owner", type: "Car", stock: "DA-1017", engine: "2.0L I4", exterior: "Modern Steel Metallic", interior: "Black cloth" },
  { id: "veh-4", year: 2015, make: "Jeep", model: "Grand Cherokee", trim: "Laredo", miles: 104300, trans: "Automatic", drive: "4x4", price: 13750, badge: "Clean Carfax", type: "SUV", stock: "DA-1028", engine: "3.6L V6", exterior: "Granite Crystal", interior: "Black cloth" },
  { id: "veh-5", year: 2013, make: "Toyota", model: "Camry", trim: "SE", miles: 121600, trans: "Automatic", drive: "FWD", price: 8995, badge: "New tires", type: "Car", stock: "DA-1009", engine: "2.5L I4", exterior: "Barcelona Red", interior: "Black cloth" },
  { id: "veh-6", year: 2018, make: "Dodge", model: "Grand Caravan", trim: "SXT", miles: 97800, trans: "Automatic", drive: "FWD", price: 11900, badge: "Third row", type: "Van", stock: "DA-1051", engine: "3.6L V6", exterior: "Granite Crystal", interior: "Gray cloth" },
  { id: "inv-7", year: 2012, make: "Honda", model: "Odyssey", trim: "EX", miles: 132500, trans: "Automatic", drive: "FWD", price: 8450, badge: "Family ready", type: "Van", stock: "DA-1003", engine: "3.5L V6", exterior: "Polished Metal", interior: "Gray cloth" },
  { id: "inv-8", year: 2016, make: "Nissan", model: "Rogue", trim: "SV", miles: 99700, trans: "Automatic", drive: "AWD", price: 10495, badge: "Clean Carfax", type: "SUV", stock: "DA-1039", engine: "2.5L I4", exterior: "Gun Metallic", interior: "Black cloth" },
  { id: "inv-9", year: 2015, make: "Chevrolet", model: "Malibu", trim: "LT", miles: 110900, trans: "Automatic", drive: "FWD", price: 8900, badge: "Great MPG", type: "Car", stock: "DA-1022", engine: "2.5L I4", exterior: "Summit White", interior: "Jet Black cloth" }
];

window.VEHICLES.forEach(v => {
  v.title = `${v.year} ${v.make} ${v.model} ${v.trim}`.trim();
  v.milesLabel = v.miles.toLocaleString();
  v.priceLabel = "$" + v.price.toLocaleString();
});
