import { db, schemesTable } from "@workspace/db";
import { sql } from "drizzle-orm";

type Rule = {
  field: string;
  operator:
    | "eq"
    | "neq"
    | "lt"
    | "lte"
    | "gt"
    | "gte"
    | "in"
    | "nin"
    | "true"
    | "false";
  value?: unknown;
  label: string;
};

type Seed = {
  slug: string;
  name: string;
  nameHindi?: string | null;
  category: string;
  ministry?: string | null;
  shortDescription: string;
  description: string;
  benefits: string[];
  requiredDocuments: string[];
  applySteps: string[];
  officialLink: string;
  applicableStates: string[];
  tags: string[];
  eligibilityRules: Rule[];
  eligibilitySummary: string;
  popularity: number;
};

const SCHEMES: Seed[] = [
  {
    slug: "national-scholarship-portal",
    name: "National Scholarship Portal",
    nameHindi: "राष्ट्रीय छात्रवृत्ति पोर्टल",
    category: "scholarship",
    ministry: "Ministry of Electronics & IT",
    shortDescription:
      "A single window for students to apply to over 100 central and state scholarships.",
    description:
      "The National Scholarship Portal (NSP) is a one-stop solution for the end-to-end disbursement of scholarships, from student application through to verification and disbursal of benefits. It hosts pre-matric, post-matric, merit-cum-means and top-class scholarships from central ministries and state governments.",
    benefits: [
      "Access to 100+ scholarships in one place",
      "Direct Benefit Transfer to your bank account",
      "Covers tuition, maintenance, books and hostel fees",
      "Single-window tracking of application status",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Bank account passbook (linked to Aadhaar)",
      "Income certificate of family",
      "Caste certificate (if applicable)",
      "Latest mark sheet",
      "Bonafide certificate from current institution",
    ],
    applySteps: [
      "Register on scholarships.gov.in with mobile and email",
      "Verify Aadhaar and OTP, then log in",
      "Fill the OTR (One-Time Registration) form with personal details",
      "Select scholarships you are eligible for",
      "Upload supporting documents",
      "Submit and note the application ID for tracking",
    ],
    officialLink: "https://scholarships.gov.in",
    applicableStates: [],
    tags: ["scholarship", "students", "education", "central"],
    eligibilityRules: [
      { field: "isStudent", operator: "true", label: "You are currently a student" },
      {
        field: "annualIncome",
        operator: "lte",
        value: 800000,
        label: "Family income is below ₹8 lakh per year",
      },
    ],
    eligibilitySummary:
      "Students pursuing school, undergraduate or postgraduate education with family income up to ₹8 lakh.",
    popularity: 100,
  },
  {
    slug: "pm-vidyalaxmi",
    name: "PM Vidyalaxmi Education Loan",
    nameHindi: "पीएम विद्यालक्ष्मी",
    category: "scholarship",
    ministry: "Ministry of Education",
    shortDescription:
      "Collateral-free, guarantor-free education loans for higher studies in quality institutions.",
    description:
      "PM Vidyalaxmi provides interest subvention and guarantees on education loans to meritorious students from families with annual income up to ₹8 lakh, enabling them to study in top-ranked institutions across India.",
    benefits: [
      "Loans up to ₹10 lakh without collateral",
      "3% interest subvention during moratorium for income up to ₹8 lakh",
      "75% credit guarantee from Government of India",
      "Single application portal for multiple banks",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "PAN card",
      "Admission letter from approved institution",
      "Income proof of parents",
      "Bank passbook",
      "10th and 12th mark sheets",
    ],
    applySteps: [
      "Visit pmvidyalaxmi.co.in",
      "Register with email and mobile",
      "Fill the Common Education Loan Application Form (CELAF)",
      "Choose preferred banks and loan amount",
      "Upload documents",
      "Track application status online",
    ],
    officialLink: "https://www.pmvidyalaxmi.co.in",
    applicableStates: [],
    tags: ["scholarship", "loan", "higher-education", "students"],
    eligibilityRules: [
      { field: "isStudent", operator: "true", label: "You are a student" },
      {
        field: "educationLevel",
        operator: "in",
        value: ["undergraduate", "postgraduate"],
        label: "Pursuing undergraduate or postgraduate studies",
      },
      {
        field: "annualIncome",
        operator: "lte",
        value: 800000,
        label: "Family income is below ₹8 lakh",
      },
    ],
    eligibilitySummary:
      "Undergraduate and postgraduate students from families with income up to ₹8 lakh seeking education loans.",
    popularity: 88,
  },
  {
    slug: "ayushman-bharat-pmjay",
    name: "Ayushman Bharat — PM Jan Arogya Yojana",
    nameHindi: "आयुष्मान भारत — पीएम जन आरोग्य योजना",
    category: "healthcare",
    ministry: "Ministry of Health & Family Welfare",
    shortDescription:
      "Free health cover up to ₹5 lakh per family per year at empanelled hospitals.",
    description:
      "PM-JAY is the world's largest government-funded health insurance scheme, providing cashless secondary and tertiary care hospitalisation up to ₹5 lakh per family per year for low-income families.",
    benefits: [
      "Cashless treatment up to ₹5 lakh per family per year",
      "Covers 1,900+ medical procedures",
      "No restriction on family size, age or gender",
      "Pre and post-hospitalisation expenses covered",
      "Available across 25,000+ empanelled hospitals nationwide",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Ration card",
      "Income certificate or SECC database verification",
      "Mobile number for OTP",
    ],
    applySteps: [
      "Check eligibility on pmjay.gov.in or call 14555",
      "Visit nearest Common Service Centre (CSC) or empanelled hospital",
      "Get your Ayushman card generated using Aadhaar",
      "Save the digital card on your phone",
      "Show the card at any empanelled hospital for cashless treatment",
    ],
    officialLink: "https://pmjay.gov.in",
    applicableStates: [],
    tags: ["healthcare", "insurance", "low-income", "family"],
    eligibilityRules: [
      { field: "hasRationCard", operator: "true", label: "You hold a ration card" },
      {
        field: "annualIncome",
        operator: "lte",
        value: 250000,
        label: "Family income is below ₹2.5 lakh per year",
      },
    ],
    eligibilitySummary:
      "Low-income families identified through SECC data or holding a BPL ration card.",
    popularity: 99,
  },
  {
    slug: "pm-kisan",
    name: "PM Kisan Samman Nidhi",
    nameHindi: "पीएम किसान सम्मान निधि",
    category: "agriculture",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    shortDescription:
      "₹6,000 per year direct income support to small and marginal farmer families.",
    description:
      "Under PM-KISAN, all eligible landholding farmer families receive financial assistance of ₹6,000 per year in three equal instalments of ₹2,000 each, transferred directly to their bank accounts.",
    benefits: [
      "₹6,000 per year in three equal instalments",
      "Direct Benefit Transfer to bank account linked with Aadhaar",
      "No middlemen — funds reach the farmer directly",
      "Helps cover input costs like seeds, fertilizers and equipment",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Bank account details",
      "Land ownership records (Khasra/Khata)",
      "Citizenship and family details",
    ],
    applySteps: [
      "Visit pmkisan.gov.in and click 'New Farmer Registration'",
      "Enter Aadhaar number and verify with OTP",
      "Fill personal, address and land ownership details",
      "Submit the form and note the registration number",
      "Get verification done at your local revenue office or CSC",
      "Track status under 'Beneficiary Status' on the portal",
    ],
    officialLink: "https://pmkisan.gov.in",
    applicableStates: [],
    tags: ["farmer", "agriculture", "income-support", "dbt"],
    eligibilityRules: [
      { field: "isFarmer", operator: "true", label: "You are a farmer with cultivable land" },
    ],
    eligibilitySummary:
      "Small and marginal farmer families holding cultivable land, with limits set by their state.",
    popularity: 95,
  },
  {
    slug: "national-food-security-act",
    name: "National Food Security Act (Ration)",
    nameHindi: "राष्ट्रीय खाद्य सुरक्षा अधिनियम",
    category: "ration",
    ministry: "Ministry of Consumer Affairs, Food & Public Distribution",
    shortDescription:
      "Subsidised foodgrains every month through the Public Distribution System.",
    description:
      "The NFSA covers up to 75% of the rural population and 50% of the urban population for receiving subsidised foodgrains under the Targeted Public Distribution System (TPDS). Eligible families receive 5 kg per person per month, while Antyodaya Anna Yojana families receive 35 kg per family.",
    benefits: [
      "Rice at ₹3/kg, wheat at ₹2/kg, coarse grains at ₹1/kg",
      "5 kg foodgrains per person per month",
      "35 kg per Antyodaya Anna Yojana family per month",
      "Free foodgrains under PMGKAY for additional support",
    ],
    requiredDocuments: [
      "Aadhaar of all family members",
      "Proof of residence",
      "Income certificate",
      "Existing ration card if any",
      "Family photograph",
    ],
    applySteps: [
      "Visit your state's food and civil supplies department portal",
      "Fill the ration card application form (online or at the nearest fair price shop)",
      "Submit family member details, income proof and address",
      "Visit your local FPS for biometric verification",
      "Collect your ration card once approved",
    ],
    officialLink: "https://nfsa.gov.in",
    applicableStates: [],
    tags: ["ration", "food", "pds", "low-income"],
    eligibilityRules: [
      {
        field: "annualIncome",
        operator: "lte",
        value: 200000,
        label: "Family income is within the eligible NFSA bracket",
      },
    ],
    eligibilitySummary:
      "Low-income families that fall within the priority household criteria set by the state.",
    popularity: 92,
  },
  {
    slug: "pm-awas-yojana",
    name: "Pradhan Mantri Awas Yojana",
    nameHindi: "प्रधानमंत्री आवास योजना",
    category: "housing",
    ministry: "Ministry of Housing & Urban Affairs",
    shortDescription:
      "Subsidy on home loans and houses for low and middle income families.",
    description:
      "PMAY aims to provide pucca houses with basic amenities to all eligible urban and rural families by 2024. Beneficiaries get interest subsidy on home loans through Credit-Linked Subsidy Scheme (CLSS) or assistance for construction.",
    benefits: [
      "Interest subsidy up to ₹2.67 lakh on home loans",
      "Direct assistance up to ₹1.20 lakh (rural) or ₹2.50 lakh (urban) for construction",
      "Preference to women, SC/ST and divyangjan applicants",
      "Houses come with toilet, electricity, LPG and water connections",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Income certificate",
      "Bank account details",
      "Caste certificate (if applicable)",
      "Land documents (for self-construction)",
    ],
    applySteps: [
      "Visit pmaymis.gov.in (urban) or pmayg.nic.in (rural)",
      "Click 'Citizen Assessment' and enter Aadhaar",
      "Fill personal, income and house preference details",
      "Submit and note the application reference number",
      "Track status with the same reference number",
    ],
    officialLink: "https://pmaymis.gov.in",
    applicableStates: [],
    tags: ["housing", "subsidy", "low-income", "women"],
    eligibilityRules: [
      {
        field: "annualIncome",
        operator: "lte",
        value: 600000,
        label: "Family income is within EWS/LIG limit",
      },
    ],
    eligibilitySummary:
      "Families with annual income up to ₹6 lakh (LIG) or ₹3 lakh (EWS) without a pucca house.",
    popularity: 90,
  },
  {
    slug: "indira-gandhi-widow-pension",
    name: "Indira Gandhi National Widow Pension Scheme",
    nameHindi: "इंदिरा गांधी राष्ट्रीय विधवा पेंशन योजना",
    category: "pension",
    ministry: "Ministry of Rural Development",
    shortDescription:
      "Monthly pension for widows from below-poverty-line families.",
    description:
      "Under the National Social Assistance Programme, widows aged 40 years and above belonging to BPL households receive a monthly pension to support their basic needs.",
    benefits: [
      "₹300 per month from central government (₹500 after age 80)",
      "Top-up by most state governments to ₹1,000–₹3,000",
      "Direct Benefit Transfer to bank account",
      "Lifetime support after enrolment",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Age proof",
      "Husband's death certificate",
      "BPL ration card",
      "Bank passbook",
      "Passport-size photograph",
    ],
    applySteps: [
      "Get the application form from your local Gram Panchayat, Block Office or Municipality",
      "Fill in personal, family and bank details",
      "Attach all documents and self-attest copies",
      "Submit at the local social welfare office",
      "Receive sanction order and pension after verification",
    ],
    officialLink: "https://nsap.nic.in",
    applicableStates: [],
    tags: ["pension", "widow", "women", "low-income"],
    eligibilityRules: [
      { field: "gender", operator: "eq", value: "female", label: "You are a woman" },
      { field: "age", operator: "gte", value: 40, label: "You are 40 years or older" },
      {
        field: "annualIncome",
        operator: "lte",
        value: 100000,
        label: "Family income falls within BPL limits",
      },
    ],
    eligibilitySummary:
      "Widows aged 40 years or older from below-poverty-line families.",
    popularity: 80,
  },
  {
    slug: "indira-gandhi-old-age-pension",
    name: "Indira Gandhi National Old Age Pension Scheme",
    nameHindi: "इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन योजना",
    category: "pension",
    ministry: "Ministry of Rural Development",
    shortDescription:
      "Monthly pension for senior citizens from BPL households.",
    description:
      "IGNOAPS provides a monthly pension to citizens aged 60 and above from below-poverty-line families. The pension amount increases after the age of 80.",
    benefits: [
      "₹200 per month from central government for ages 60–79",
      "₹500 per month for ages 80 and above",
      "Most state governments add a top-up taking total pension to ₹1,000–₹3,000",
      "DBT directly to bank or post office account",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Age proof",
      "BPL ration card",
      "Bank passbook",
      "Passport-size photograph",
    ],
    applySteps: [
      "Collect the application form from your Gram Panchayat or local Tehsil office",
      "Fill in personal, family and bank details",
      "Attach age proof, BPL card, Aadhaar and bank passbook",
      "Submit at the social welfare office or BDO",
      "Pension begins after verification and approval",
    ],
    officialLink: "https://nsap.nic.in",
    applicableStates: [],
    tags: ["pension", "senior-citizen", "elderly", "low-income"],
    eligibilityRules: [
      { field: "isSeniorCitizen", operator: "true", label: "You are a senior citizen (60+)" },
      {
        field: "annualIncome",
        operator: "lte",
        value: 100000,
        label: "Family income falls within BPL limits",
      },
    ],
    eligibilitySummary:
      "Senior citizens aged 60 and above from below-poverty-line families.",
    popularity: 85,
  },
  {
    slug: "skill-india-pmkvy",
    name: "PM Kaushal Vikas Yojana (Skill India)",
    nameHindi: "पीएम कौशल विकास योजना",
    category: "employment",
    ministry: "Ministry of Skill Development & Entrepreneurship",
    shortDescription:
      "Free short-term skill training and certification for youth seeking jobs.",
    description:
      "PMKVY offers free short-term training and certification in industry-relevant skills, helping youth become employable. The scheme also recognises prior learning of those already in the workforce.",
    benefits: [
      "Completely free short-term training (200–600 hours)",
      "Government-recognised certification accepted by employers",
      "Stipend support and placement assistance",
      "Special focus on women, SC/ST and rural youth",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "10th or 12th mark sheet",
      "Bank account details",
      "Recent photograph",
    ],
    applySteps: [
      "Visit pmkvyofficial.org or skillindia.gov.in",
      "Search for a training centre near you",
      "Choose a course aligned with your interests",
      "Visit the centre with documents and enroll",
      "Complete the training and assessment to receive your certificate",
    ],
    officialLink: "https://www.pmkvyofficial.org",
    applicableStates: [],
    tags: ["employment", "skill", "youth", "training"],
    eligibilityRules: [
      { field: "age", operator: "gte", value: 15, label: "You are 15 years or older" },
      { field: "age", operator: "lte", value: 45, label: "You are under 45 years of age" },
      {
        field: "employmentStatus",
        operator: "in",
        value: ["unemployed", "student", "self_employed"],
        label: "You are looking to learn a new skill",
      },
    ],
    eligibilitySummary:
      "Indian citizens aged 15–45 who are unemployed, students, or want to learn a new skill.",
    popularity: 78,
  },
  {
    slug: "startup-india-seed-fund",
    name: "Startup India Seed Fund Scheme",
    nameHindi: "स्टार्टअप इंडिया सीड फंड",
    category: "employment",
    ministry: "Department for Promotion of Industry & Internal Trade",
    shortDescription:
      "Seed funding up to ₹50 lakh for early-stage startups across India.",
    description:
      "The Startup India Seed Fund Scheme provides financial assistance to startups for proof of concept, prototype development, product trials, market entry and commercialisation through approved incubators.",
    benefits: [
      "Grants up to ₹20 lakh for proof of concept and prototype",
      "Convertible debentures up to ₹50 lakh for market entry",
      "Mentorship through DPIIT-recognised incubators",
      "Tax exemptions and IPR fast-tracking",
    ],
    requiredDocuments: [
      "DPIIT recognition certificate",
      "Aadhaar and PAN of founders",
      "Pitch deck and business plan",
      "Incorporation certificate of the company",
      "Bank account details of the startup",
    ],
    applySteps: [
      "Register your startup on startupindia.gov.in",
      "Get DPIIT recognition through the Startup India portal",
      "Apply to a DPIIT-empanelled incubator via seedfund.startupindia.gov.in",
      "Pitch to the incubator's screening committee",
      "Receive the disbursal as per milestones",
    ],
    officialLink: "https://www.startupindia.gov.in",
    applicableStates: [],
    tags: ["startup", "employment", "youth", "entrepreneur"],
    eligibilityRules: [
      { field: "age", operator: "gte", value: 18, label: "You are 18 years or older" },
      {
        field: "employmentStatus",
        operator: "in",
        value: ["self_employed", "unemployed", "student"],
        label: "You are starting or running a startup",
      },
    ],
    eligibilitySummary:
      "Founders of DPIIT-recognised startups (under 2 years old) seeking early-stage funding.",
    popularity: 60,
  },
  {
    slug: "beti-bachao-beti-padhao",
    name: "Beti Bachao Beti Padhao + Sukanya Samriddhi",
    nameHindi: "बेटी बचाओ बेटी पढ़ाओ",
    category: "women",
    ministry: "Ministry of Women & Child Development",
    shortDescription:
      "Savings, scholarships and welfare benefits for the girl child.",
    description:
      "The umbrella initiative protects, educates and empowers the girl child through campaigns, the Sukanya Samriddhi Yojana savings account, and dedicated scholarships and incentives across states.",
    benefits: [
      "Sukanya Samriddhi account with ~8% guaranteed annual interest",
      "Income tax exemption under Section 80C",
      "Scholarships and cash incentives for girls' education",
      "Free uniform, books and bicycles in many states",
    ],
    requiredDocuments: [
      "Birth certificate of the girl child",
      "Aadhaar of parent/guardian",
      "Address proof",
      "Bank or post office account opening form",
    ],
    applySteps: [
      "Visit your nearest post office or authorised bank branch",
      "Fill the Sukanya Samriddhi Yojana account opening form",
      "Submit the girl child's birth certificate and KYC documents",
      "Make the initial deposit (minimum ₹250)",
      "Get the passbook and start saving regularly",
    ],
    officialLink:
      "https://wcd.nic.in/schemes/beti-bachao-beti-padhao-scheme",
    applicableStates: [],
    tags: ["women", "girl-child", "savings", "education"],
    eligibilityRules: [
      { field: "gender", operator: "eq", value: "female", label: "You are a girl/woman" },
    ],
    eligibilitySummary:
      "Girl children below 10 years of age (for SSY) and women applying for related welfare benefits.",
    popularity: 75,
  },
  {
    slug: "national-handicapped-finance",
    name: "National Handicapped Finance & Development Corp Scheme",
    nameHindi: "राष्ट्रीय विकलांग वित्त एवं विकास निगम",
    category: "disability",
    ministry: "Ministry of Social Justice & Empowerment",
    shortDescription:
      "Concessional loans and skill training for persons with disabilities.",
    description:
      "NHFDC provides concessional credit, skill training and self-employment support to persons with disabilities (Divyangjan) so they can pursue education, vocational training and entrepreneurship.",
    benefits: [
      "Loans up to ₹50 lakh at low interest for self-employment",
      "Education loans for higher studies in India and abroad",
      "Skill training scholarships",
      "Special schemes for women with disabilities",
    ],
    requiredDocuments: [
      "Disability certificate (40% or more)",
      "Aadhaar card",
      "Income certificate",
      "Bank account details",
      "Project report (for business loans)",
    ],
    applySteps: [
      "Visit nhfdc.nic.in",
      "Choose the appropriate loan or scheme",
      "Apply through your State Channelising Agency or partner bank",
      "Submit the disability certificate and other documents",
      "Receive disbursal after sanction",
    ],
    officialLink: "https://nhfdc.nic.in",
    applicableStates: [],
    tags: ["disability", "divyangjan", "loan", "self-employment"],
    eligibilityRules: [
      { field: "hasDisability", operator: "true", label: "You hold a disability certificate" },
      { field: "age", operator: "gte", value: 18, label: "You are 18 years or older" },
    ],
    eligibilitySummary:
      "Persons with 40% or more disability seeking education, training or self-employment support.",
    popularity: 55,
  },
];

async function main() {
  console.log("Clearing existing schemes...");
  await db.execute(sql`TRUNCATE TABLE schemes RESTART IDENTITY CASCADE`);

  console.log(`Inserting ${SCHEMES.length} schemes...`);
  for (const s of SCHEMES) {
    await db.insert(schemesTable).values({
      slug: s.slug,
      name: s.name,
      nameHindi: s.nameHindi ?? null,
      category: s.category,
      ministry: s.ministry ?? null,
      shortDescription: s.shortDescription,
      description: s.description,
      benefits: s.benefits,
      requiredDocuments: s.requiredDocuments,
      applySteps: s.applySteps,
      officialLink: s.officialLink,
      applicableStates: s.applicableStates,
      tags: s.tags,
      eligibilityRules: s.eligibilityRules,
      eligibilitySummary: s.eligibilitySummary,
      popularity: s.popularity,
    });
  }
  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
