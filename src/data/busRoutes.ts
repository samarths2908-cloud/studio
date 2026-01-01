// src/data/busRoutes.ts
export type Stop = {
  id: string;
  name: string;
  coords: [number, number];
};

export const busRoutes: Record<string, Stop[]> = {
  Bus1: [
    { id: "talapady", name: "Talapady (Checkpoint / Border)", coords: [12.7640, 74.8800] },
    { id: "beeri", name: "Beeri (Junction)", coords: [12.8092, 74.8864] },
    { id: "kotekar", name: "Kotekar", coords: [12.7966, 74.8873] },
    { id: "kolya", name: "Kolya", coords: [12.8174, 74.8819] },
    { id: "college", name: "Canara Engineering College", coords: [12.9017, 74.9995] },
  ],

  Bus2: [
    { id: "darbe_circle", name: "Darbe Circle, Puttur", coords: [12.7548, 75.2123] },
    { id: "mega_school", name: "MEGA School Books, Main Road", coords: [12.7609, 75.2038] },
    { id: "city_mart", name: "City Mart, Bolwar", coords: [12.7678, 75.1954] },
    { id: "sanjeevini", name: "Sanjeevini Clinic, Nehru Nagar", coords: [12.7774, 75.1812] },
    { id: "kabaka", name: "Kabaka Bus Stop", coords: [12.7862, 75.1565] },
    { id: "sadguru", name: "Hotel Sadguru, Mani", coords: [12.8220, 75.1286] },
    { id: "mani", name: "Mani, Karnataka", coords: [12.8356, 75.1215] },
    { id: "dasakodi", name: "Nethravathi Nursery, Dasakodi", coords: [12.8407, 75.0967] },
    { id: "kalladka", name: "Kalladka, Karnataka", coords: [12.8438, 75.0714] },
    { id: "college", name: "Canara Engineering College", coords: [12.9017, 74.9995] },
  ],

  Bus3: [
    { id: "kavoor", name: "Kavoor, Mangaluru", coords: [12.9260, 74.8583] },
    { id: "mind_space", name: "MIND SPACE, Yeyyadi", coords: [12.9242, 74.8631] },
    { id: "ayyengar_bakery", name: "New Bangalore Ayyangar Bakery", coords: [12.9235, 74.8685] },
    { id: "bondel_church", name: "Bondel Church Open Grounds", coords: [12.9172, 74.8691] },
    { id: "maryhill", name: "Inland Arcade, Mary Hill", coords: [12.9103, 74.8676] },
    { id: "booking_allis", name: "Booking Allis, Yeyyadi", coords: [12.9061, 74.8645] },
    { id: "uniform_company", name: "Indian Uniform Company", coords: [12.8978, 74.8597] },
    { id: "kpt", name: "Tulunad Riksha Park, KPT", coords: [12.8908, 74.8547] },
    { id: "kaikamba", name: "ENT Clinic, Kaikamba", coords: [12.8849, 74.8676] },
    { id: "college", name: "Canara Engineering College", coords: [12.9017, 74.9995] },
  ],

  Bus4: [
    { id: "nitk", name: "NITK Bus Stop, Surathkal", coords: [13.0108, 74.7943] },
    { id: "govinda_dasa", name: "Govinda Dasa Degree College", coords: [13.0012, 74.8023] },
    { id: "hosabettu", name: "Jyothi Nivas, Hosabettu", coords: [12.9928, 74.8066] },
    { id: "kulai", name: "Sree Laxmi Medicals, Kulai", coords: [12.9734, 74.8118] },
    { id: "baikampady", name: "Baikampady Industrial Area", coords: [12.9631, 74.8145] },
    { id: "panambur", name: "Parisons Infrastructure, Panambur", coords: [12.9426, 74.8145] },
    { id: "kuloor", name: "Shree Pooja Medicals, Kuloor", coords: [12.9254, 74.8310] },
    { id: "kodical", name: "Kodical Cross, Ashok Nagar", coords: [12.9118, 74.8329] },
    { id: "polytechnic", name: "Karnataka Govt. Polytechnic", coords: [12.8912, 74.8548] },
    { id: "college", name: "Canara Engineering College", coords: [12.9017, 74.9995] },
  ],

  Bus5: [
    { id: "rto", name: "RTO Mangaluru, Attavar", coords: [12.8611, 74.8393] },
    { id: "core_computer", name: "Core Computer (NI), Bunder", coords: [12.8535, 74.8409] },
    { id: "indianoil", name: "IndianOil, Mangala Nagar", coords: [12.8501, 74.8484] },
    { id: "nandini", name: "Nandini Milk Parlour, Valencia", coords: [12.8527, 74.8516] },
    { id: "jeppu_church", name: "St. Joseph's Church, Jeppu", coords: [12.8612, 74.8550] },
    { id: "goveas", name: "Goveas Commercial Complex, Valencia", coords: [12.8630, 74.8568] },
    { id: "kankanady", name: "Sufy – Web Design, Kankanady", coords: [12.8645, 74.8578] },
    { id: "pumpwell", name: "Muthoot FinCorp, Pumpwell Circle", coords: [12.8691, 74.8641] },
    { id: "college", name: "Canara Engineering College", coords: [12.9017, 74.9995] },
  ],

  Bus6: [
    { id: "jyothi_clinic", name: "Jyothi Clinic, Ashok Nagar", coords: [12.8942, 74.8347] },
    { id: "scs_ayurveda", name: "SCS Ayurveda, Hoigebail Road", coords: [12.8915, 74.8324] },
    { id: "gandhinagar", name: "Gandhinagar School", coords: [12.8872, 74.8341] },
    { id: "mannagudda_gurji", name: "Shreedath, Mannagudda Gurji", coords: [12.8831, 74.8344] },
    { id: "mannagudda_road", name: "Aditya Stores, Mannagudda Road", coords: [12.8819, 74.8340] },
    { id: "ballalbagh", name: "Vertex Workspace, Ballalbagh", coords: [12.8795, 74.8406] },
    { id: "mg_road", name: "Shet Crackers Shop, MG Road", coords: [12.8768, 74.8415] },
    { id: "bunts_hostel", name: "Bunts Hostel Circle", coords: [12.8745, 74.8454] },
    { id: "nanthur", name: "Nanthur Junction, Kadri", coords: [12.8778, 74.8622] },
    { id: "college", name: "Canara Engineering College", coords: [12.9017, 74.9995] },
  ],

  Bus7: [
    { id: "kumpala_sweets", name: "Kumpala Sweets, Kumpala Road", coords: [12.8055, 74.8617] },
    { id: "hullalu", name: "Hullalu, Jnana Ganga Nagar", coords: [12.8258, 74.8519] },
    { id: "abbakka", name: "Abbakka Circle, Ullal", coords: [12.8149, 74.8429] },
    { id: "thokottu", name: "Al Ameen Fast Food, Thokottu", coords: [12.8341, 74.8624] },
    { id: "jeppinamogaru", name: "Jeppinamogaru Bus Stop", coords: [12.8385, 74.8698] },
    { id: "nadu_moger", name: "Nadu Moger Bus Stand", coords: [12.8465, 74.8711] },
    { id: "pumpwell_bc", name: "Pumpwell–BC Road Service Stop", coords: [12.8687, 74.8752] },
    { id: "college", name: "Canara Engineering College", coords: [12.9017, 74.9995] },
  ],

  Bus8: [
    { id: "pandith_house", name: "MedPlus Pandith House", coords: [12.8252, 74.8809] },
    { id: "kuthar", name: "The Icon Bus Stop, Kuthar", coords: [12.8206, 74.8845] },
    { id: "natekal", name: "Electrobreg Solutions, Natekal", coords: [12.8241, 74.9084] },
    { id: "mudipu", name: "Harsha Sweets, Mudipu", coords: [12.8211, 74.9609] },
    { id: "melkar", name: "Melkar Junction", coords: [12.8569, 75.0264] },
    { id: "kallurti", name: "Sri Satyadevata Kallurti Gudi", coords: [12.8722, 75.0349] },
    { id: "bc_road", name: "Taluk Panchayat Building, BC Road", coords: [12.8943, 74.9947] },
    { id: "ammunje", name: "Nice Dine Cafe, Ammunje", coords: [12.9069, 75.0274] },
    { id: "college", name: "Canara Engineering College", coords: [12.9017, 74.9995] },
  ],

  Bus9: [
    { id: "derebail", name: "Laxman Building, Derebail", coords: [12.9099, 74.8367] },
    { id: "durga_nivas", name: "Sree Durga Nivas Hotel", coords: [12.9086, 74.8377] },
    { id: "maisandaya", name: "Maisandaya Daivasthana", coords: [12.9084, 74.8412] },
    { id: "konchadi", name: "Varnaa Paints, Konchadi", coords: [12.9062, 74.8474] },
    { id: "panchami", name: "Panchami Tour's & Travels", coords: [12.9106, 74.8521] },
    { id: "sk_tools", name: "S.K. Tools & Compressors", coords: [12.8994, 74.8438] },
    { id: "nisarga", name: "Nisarga Fancy Gifts Centre", coords: [12.8860, 74.8415] },
    { id: "kadri_hills", name: "IndianOil, Kadri Hills", coords: [12.8906, 74.8548] },
    { id: "college", name: "Canara Engineering College", coords: [12.9017, 74.9995] },
  ],
};
