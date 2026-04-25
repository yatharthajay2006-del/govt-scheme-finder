import type { Profile } from "./eligibility";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
  "Chandigarh",
];

export function parseVoiceInput(
  text: string,
  language?: string | null,
): { profile: Profile; extractedFields: string[] } {
  const profile: Profile = {};
  const extracted: string[] = [];
  const lower = text.toLowerCase();

  // Age
  const ageMatch =
    text.match(/(\d{1,3})[\s-]?(?:year|yr|years|yrs|साल|वर्ष)/i) ??
    text.match(/age (?:is |of )?(\d{1,3})/i) ??
    text.match(/i am (\d{1,3})/i) ??
    text.match(/मेरी उम्र (\d{1,3})/i);
  if (ageMatch) {
    const n = Number(ageMatch[1]);
    if (!Number.isNaN(n) && n > 0 && n < 130) {
      profile.age = n;
      extracted.push("age");
    }
  }

  // Income (lakhs / thousands / rupees)
  const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*lakh/i);
  const incomeRupeesMatch = text.match(
    /(?:income|salary|earn|आय|कमाई|कमाते)\s*(?:is|of|approx|around|per year|per annum|annually|yearly)?\s*(?:rs\.?|inr|₹)?\s*(\d{4,8})/i,
  );
  if (lakhMatch) {
    profile.annualIncome = Math.round(Number(lakhMatch[1]) * 100000);
    extracted.push("annualIncome");
  } else if (incomeRupeesMatch) {
    profile.annualIncome = Number(incomeRupeesMatch[1]);
    extracted.push("annualIncome");
  }

  // Gender
  if (
    /\b(female|woman|girl|lady|wife|mother|daughter|sister|widow)\b/i.test(text) ||
    /(महिला|लड़की|बहन|बेटी|माँ|पत्नी|विधवा)/.test(text)
  ) {
    profile.gender = "female";
    extracted.push("gender");
  } else if (
    /\b(male|man|boy|husband|father|son|brother)\b/i.test(text) ||
    /(पुरुष|लड़का|भाई|बेटा|पिता|पति)/.test(text)
  ) {
    profile.gender = "male";
    extracted.push("gender");
  }

  // State detection
  for (const state of INDIAN_STATES) {
    if (lower.includes(state.toLowerCase())) {
      profile.state = state;
      extracted.push("state");
      break;
    }
  }

  // Student
  if (
    /\b(student|study|studying|college|university|school|class \d+)\b/i.test(text) ||
    /(छात्र|छात्रा|पढ़|विद्यार्थी|कॉलेज|स्कूल)/.test(text)
  ) {
    profile.isStudent = true;
    extracted.push("isStudent");
    if (/(college|university|कॉलेज|यूनिवर्सिटी|graduate|बीए|बीएससी|बीटेक)/i.test(text)) {
      profile.educationLevel = "undergraduate";
      extracted.push("educationLevel");
    } else if (/(post[-\s]?graduate|एमए|एमएससी|पोस्ट)/i.test(text)) {
      profile.educationLevel = "postgraduate";
      extracted.push("educationLevel");
    } else if (/(school|class \d+|स्कूल|कक्षा)/i.test(text)) {
      profile.educationLevel = "school";
      extracted.push("educationLevel");
    }
  }

  // Farmer
  if (/\b(farmer|farming|कृषि|किसान|खेती)\b/i.test(text)) {
    profile.isFarmer = true;
    extracted.push("isFarmer");
  }
  if (/(father is .*(?:farmer|किसान)|मेरे पिता.*किसान)/i.test(text)) {
    profile.isFarmer = true;
    if (!extracted.includes("isFarmer")) extracted.push("isFarmer");
  }

  // Disability
  if (
    /\b(disabl|disability|handicap|divyang|दिव्यांग|विकलांग)\b/i.test(text)
  ) {
    profile.hasDisability = true;
    extracted.push("hasDisability");
  }

  // Ration card
  if (/(ration card|राशन कार्ड|राशन)/i.test(text)) {
    profile.hasRationCard = true;
    extracted.push("hasRationCard");
  }

  // Senior citizen
  if (/(senior citizen|elderly|वरिष्ठ|बुज़ुर्ग|बूढ़ा|वृद्ध)/i.test(text)) {
    profile.isSeniorCitizen = true;
    extracted.push("isSeniorCitizen");
  }
  if (
    typeof profile.age === "number" &&
    profile.age >= 60 &&
    profile.isSeniorCitizen !== true
  ) {
    profile.isSeniorCitizen = true;
    if (!extracted.includes("isSeniorCitizen"))
      extracted.push("isSeniorCitizen");
  }

  // Caste category
  if (/\bsc\b|scheduled caste|अनुसूचित जाति/i.test(text)) {
    profile.casteCategory = "sc";
    extracted.push("casteCategory");
  } else if (/\bst\b|scheduled tribe|अनुसूचित जनजाति/i.test(text)) {
    profile.casteCategory = "st";
    extracted.push("casteCategory");
  } else if (/\bobc\b|backward class|पिछड़ा वर्ग/i.test(text)) {
    profile.casteCategory = "obc";
    extracted.push("casteCategory");
  } else if (/general category|सामान्य वर्ग/i.test(text)) {
    profile.casteCategory = "general";
    extracted.push("casteCategory");
  } else if (/minority|अल्पसंख्यक/i.test(text)) {
    profile.casteCategory = "minority";
    extracted.push("casteCategory");
  }

  // Employment status
  if (/\b(unemployed|jobless|बेरोज़गार)\b/i.test(text)) {
    profile.employmentStatus = "unemployed";
    extracted.push("employmentStatus");
  } else if (/\b(employed|working|नौकरी|कर्मचारी)\b/i.test(text)) {
    profile.employmentStatus = "employed";
    extracted.push("employmentStatus");
  } else if (/(self[-\s]?employed|business|व्यवसाय)/i.test(text)) {
    profile.employmentStatus = "self_employed";
    extracted.push("employmentStatus");
  } else if (profile.isStudent) {
    profile.employmentStatus = "student";
    if (!extracted.includes("employmentStatus"))
      extracted.push("employmentStatus");
  }

  void language; // language hint reserved for future use

  return { profile, extractedFields: Array.from(new Set(extracted)) };
}
