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
  lastUpdated?: string;
  applicationStartDate?: string | null;
  applicationEndDate?: string | null;
};

const DEFAULT_LAST_UPDATED = "2026-01-20";

// Real annual application windows for cycle-based schemes.
// Slugs not listed here remain "Always Open" (no fixed deadline).
const APPLICATION_WINDOWS: Record<string, { start: string; end: string }> = {
  // National Scholarship Portal — pre/post-matric cycle for academic year 2026-27
  "national-scholarship-portal": { start: "2026-07-01", end: "2026-10-31" },
  // INSPIRE Scholarship for Higher Education — annual application window
  "inspire-scholarship": { start: "2026-06-15", end: "2026-10-15" },
  // PM Special Scholarship Scheme for J&K and Ladakh — annual cycle
  "jk-pmsss": { start: "2026-06-15", end: "2026-08-31" },
  // Pragati Scholarship for Girls (AICTE) — annual cycle
  "pragati-scholarship-girls": { start: "2026-09-01", end: "2026-11-30" },
  // Saksham Scholarship for Disabled (AICTE) — annual cycle
  "saksham-scholarship-disabled": { start: "2026-09-01", end: "2026-11-30" },
  // CBSE Single Girl Child Scholarship — annual cycle (announced after CBSE results)
  "cbse-single-girl-child": { start: "2026-09-15", end: "2026-10-31" },
  // National Means-cum-Merit Scholarship — annual exam cycle
  "national-means-merit-scholarship": { start: "2026-08-01", end: "2026-10-15" },
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
    slug: "inspire-scholarship",
    name: "INSPIRE Scholarship for Higher Education",
    nameHindi: "इंस्पायर छात्रवृत्ति",
    category: "scholarship",
    ministry: "Department of Science & Technology",
    shortDescription:
      "₹80,000 per year for top 1% of class 12 students pursuing natural and basic sciences.",
    description:
      "INSPIRE-SHE (Scholarship for Higher Education) attracts talented youth to pursue science by giving an annual scholarship of ₹80,000 (₹60,000 stipend + ₹20,000 mentorship grant) for five years to students in the top 1% of their state board class 12 results who join BSc, BS, Integrated MSc or MS programmes.",
    benefits: [
      "₹80,000 per year for up to 5 years (₹4 lakh total)",
      "Mentorship under top scientists in summer camps",
      "Direct Benefit Transfer to your bank account",
      "Recognition as a future scientist of India",
    ],
    requiredDocuments: [
      "Class 12 mark sheet (top 1% of state board)",
      "Aadhaar card",
      "Bank passbook",
      "Bonafide certificate from college",
      "Course details from current institution",
    ],
    applySteps: [
      "Visit online-inspire.gov.in",
      "Register with email and mobile",
      "Fill personal, academic and bank details",
      "Upload Class 12 mark sheet and bonafide letter",
      "Submit and note your application ID",
      "Track status under your dashboard",
    ],
    officialLink: "https://online-inspire.gov.in",
    applicableStates: [],
    tags: ["scholarship", "science", "students", "merit"],
    eligibilityRules: [
      { field: "isStudent", operator: "true", label: "You are currently a student" },
      { field: "age", operator: "lte", value: 27, label: "You are under 27 years old" },
      {
        field: "educationLevel",
        operator: "in",
        value: ["undergraduate", "postgraduate"],
        label: "Pursuing UG or PG in basic / natural sciences",
      },
    ],
    eligibilitySummary:
      "Top 1% of Class 12 board students who choose BSc, BS, Integrated MSc or MS in natural sciences.",
    popularity: 70,
  },
  {
    slug: "post-matric-sc-scholarship",
    name: "Post Matric Scholarship for SC Students",
    nameHindi: "अनुसूचित जाति पोस्ट मैट्रिक छात्रवृत्ति",
    category: "scholarship",
    ministry: "Ministry of Social Justice & Empowerment",
    shortDescription:
      "Tuition, maintenance and study tour grants for SC students from class 11 to PhD.",
    description:
      "The Centrally Sponsored Post Matric Scholarship Scheme covers full course fees, monthly maintenance allowance, study-tour charges and book grants for Scheduled Caste students whose family income is below ₹2.5 lakh per year.",
    benefits: [
      "Full course fee reimbursement (tuition + non-refundable charges)",
      "Monthly maintenance allowance ₹230–₹1,500 based on course",
      "Book and stationery grant",
      "Study tour and thesis-typing allowance for research scholars",
    ],
    requiredDocuments: [
      "Caste certificate (SC)",
      "Income certificate (≤ ₹2.5 lakh)",
      "Aadhaar card",
      "Class 10 mark sheet",
      "Bonafide certificate",
      "Bank passbook (Aadhaar-linked)",
    ],
    applySteps: [
      "Register on the National Scholarship Portal at scholarships.gov.in",
      "Select 'Post-Matric Scholarship for SC' in your state",
      "Fill academic, family and bank details",
      "Upload caste, income and bonafide certificates",
      "Get your application verified by your institute",
      "Track approval under 'Application Status'",
    ],
    officialLink: "https://scholarships.gov.in",
    applicableStates: [],
    tags: ["scholarship", "sc", "students", "post-matric"],
    eligibilityRules: [
      { field: "isStudent", operator: "true", label: "You are a student in class 11 or higher" },
      {
        field: "casteCategory",
        operator: "eq",
        value: "sc",
        label: "You belong to Scheduled Caste",
      },
      {
        field: "annualIncome",
        operator: "lte",
        value: 250000,
        label: "Family income is below ₹2.5 lakh",
      },
    ],
    eligibilitySummary:
      "SC students pursuing post-matric education with family income up to ₹2.5 lakh.",
    popularity: 84,
  },
  {
    slug: "pm-yashasvi-obc",
    name: "PM YASASVI Scholarship (OBC, EBC, DNT)",
    nameHindi: "पीएम यशस्वी छात्रवृत्ति",
    category: "scholarship",
    ministry: "Ministry of Social Justice & Empowerment",
    shortDescription:
      "Pre and post-matric scholarships for OBC, EBC and DNT students up to PhD.",
    description:
      "PM YASASVI is an umbrella scholarship for Other Backward Class, Economically Backward Class and De-notified Tribe students covering school (class 9–10), top class school (class 9–12 in best private schools) and post-matric education up to PhD.",
    benefits: [
      "₹4,000 per year (Pre-Matric, class 9–10)",
      "Up to ₹1.25 lakh per year (Top Class School fees + ₹3,000 stipend)",
      "Full course fee + maintenance for college students",
      "Special hostel and book allowances",
    ],
    requiredDocuments: [
      "OBC / EBC / DNT certificate",
      "Income certificate (≤ ₹2.5 lakh)",
      "Aadhaar card",
      "Bonafide certificate",
      "Bank passbook (Aadhaar-linked)",
    ],
    applySteps: [
      "Register on yet.nta.ac.in (for top-class) or scholarships.gov.in (post-matric)",
      "Choose the appropriate YASASVI component",
      "Fill personal, academic and bank details",
      "Upload caste, income and bonafide certificates",
      "Submit and note your application number",
      "Get verification done by your institute",
    ],
    officialLink: "https://yet.nta.ac.in",
    applicableStates: [],
    tags: ["scholarship", "obc", "ebc", "dnt", "students"],
    eligibilityRules: [
      { field: "isStudent", operator: "true", label: "You are currently a student" },
      {
        field: "casteCategory",
        operator: "in",
        value: ["obc", "ebc"],
        label: "You belong to OBC, EBC or DNT",
      },
      {
        field: "annualIncome",
        operator: "lte",
        value: 250000,
        label: "Family income is below ₹2.5 lakh",
      },
    ],
    eligibilitySummary:
      "OBC / EBC / DNT students from class 9 to PhD with family income up to ₹2.5 lakh.",
    popularity: 76,
  },
  {
    slug: "pragati-scholarship-girls",
    name: "AICTE Pragati Scholarship for Girls",
    nameHindi: "एआईसीटीई प्रगति छात्रवृत्ति (बालिकाओं हेतु)",
    category: "scholarship",
    ministry: "All India Council for Technical Education",
    shortDescription:
      "₹50,000 per year for girls pursuing technical diploma or degree.",
    description:
      "Pragati supports the technical education of girls by giving a scholarship of ₹50,000 per year to up to 5,000 girls every year admitted to AICTE-approved degree or diploma programmes. Two girls per family are eligible.",
    benefits: [
      "₹50,000 per year for tuition, books and laptop",
      "Up to two girls per family can apply",
      "Direct Benefit Transfer to bank",
      "Encourages women in engineering and technology",
    ],
    requiredDocuments: [
      "Admission letter from AICTE-approved institute",
      "Income certificate (≤ ₹8 lakh)",
      "Aadhaar card",
      "Class 10 and 12 mark sheets",
      "Bank passbook (Aadhaar-linked)",
    ],
    applySteps: [
      "Apply on scholarships.gov.in under AICTE schemes",
      "Select 'Pragati Scholarship for Girls'",
      "Upload admission letter, income and caste certificates",
      "Submit and note your application ID",
      "Wait for institute verification",
    ],
    officialLink: "https://www.aicte-india.org/schemes/students-development-schemes",
    applicableStates: [],
    tags: ["scholarship", "girls", "women", "technical-education"],
    eligibilityRules: [
      { field: "gender", operator: "eq", value: "female", label: "You are a girl/woman" },
      { field: "isStudent", operator: "true", label: "You are a student" },
      {
        field: "annualIncome",
        operator: "lte",
        value: 800000,
        label: "Family income is below ₹8 lakh",
      },
    ],
    eligibilitySummary:
      "Girls admitted to AICTE-approved diploma or degree programmes with family income up to ₹8 lakh.",
    popularity: 72,
  },
  {
    slug: "saksham-scholarship-disabled",
    name: "AICTE Saksham Scholarship for Differently-abled",
    nameHindi: "एआईसीटीई सक्षम छात्रवृत्ति",
    category: "scholarship",
    ministry: "All India Council for Technical Education",
    shortDescription:
      "₹50,000 per year for differently-abled students in technical courses.",
    description:
      "Saksham provides ₹50,000 per year to differently-abled students (40% or more disability) admitted to AICTE-approved degree or diploma programmes, helping cover tuition, books, equipment and accessibility needs.",
    benefits: [
      "₹50,000 per year for tuition, books and equipment",
      "Up to 1,000 fresh scholarships per year",
      "Direct Benefit Transfer to bank",
      "Promotes inclusion in technical education",
    ],
    requiredDocuments: [
      "Disability certificate (40% or more)",
      "Admission letter from AICTE-approved institute",
      "Income certificate (≤ ₹8 lakh)",
      "Aadhaar card",
      "Bank passbook",
    ],
    applySteps: [
      "Apply on scholarships.gov.in under AICTE schemes",
      "Select 'Saksham Scholarship for Differently-abled'",
      "Upload disability, admission and income certificates",
      "Submit and note your application ID",
      "Get institute verification",
    ],
    officialLink: "https://www.aicte-india.org/schemes/students-development-schemes",
    applicableStates: [],
    tags: ["scholarship", "disability", "technical-education"],
    eligibilityRules: [
      { field: "isStudent", operator: "true", label: "You are a student" },
      { field: "hasDisability", operator: "true", label: "You hold a disability certificate" },
      {
        field: "annualIncome",
        operator: "lte",
        value: 800000,
        label: "Family income is below ₹8 lakh",
      },
    ],
    eligibilitySummary:
      "Differently-abled students in AICTE-approved courses with family income up to ₹8 lakh.",
    popularity: 60,
  },
  {
    slug: "cbse-single-girl-child",
    name: "CBSE Single Girl Child Scholarship",
    nameHindi: "सीबीएसई एकल बालिका छात्रवृत्ति",
    category: "scholarship",
    ministry: "Central Board of Secondary Education",
    shortDescription:
      "₹500 per month for two years for single girl child class 11 & 12 toppers.",
    description:
      "Awarded to single girl children of their parents who have secured 60% or more in CBSE class 10 and are continuing class 11 and 12 studies in a school where the tuition fee does not exceed ₹2,500 per month.",
    benefits: [
      "₹500 per month for 24 months (₹12,000 total)",
      "Renewable in class 12 if you score 50% or more in class 11",
      "Direct Benefit Transfer to bank",
      "Encouragement for girls' education",
    ],
    requiredDocuments: [
      "Class 10 CBSE mark sheet (≥ 60%)",
      "Affidavit / certificate of single girl child status",
      "Aadhaar card",
      "Bank passbook",
      "Tuition fee receipt of class 11",
    ],
    applySteps: [
      "Visit cbse.gov.in/scholarship and select 'Single Girl Child'",
      "Register with your CBSE roll number and date of birth",
      "Fill personal, academic and bank details",
      "Upload single-girl-child affidavit and mark sheet",
      "Submit before the deadline (usually December)",
    ],
    officialLink: "https://www.cbse.gov.in",
    applicableStates: [],
    tags: ["scholarship", "girls", "cbse", "merit"],
    eligibilityRules: [
      { field: "gender", operator: "eq", value: "female", label: "You are a girl" },
      { field: "isStudent", operator: "true", label: "You are a student" },
      { field: "age", operator: "lte", value: 19, label: "You are class 11 or 12 age" },
    ],
    eligibilitySummary:
      "Single girl children who scored 60% or more in CBSE class 10 and are studying class 11/12.",
    popularity: 58,
  },
  {
    slug: "national-means-merit-scholarship",
    name: "National Means-cum-Merit Scholarship (NMMSS)",
    nameHindi: "राष्ट्रीय साधन सह मेधा छात्रवृत्ति",
    category: "scholarship",
    ministry: "Ministry of Education",
    shortDescription:
      "₹12,000 per year for class 9–12 students from low-income families.",
    description:
      "NMMSS provides ₹12,000 per year (₹1,000 per month) to meritorious students from low-income families to help them complete secondary and higher secondary education without dropping out. Selection is through a state-conducted exam in class 8.",
    benefits: [
      "₹12,000 per year for 4 years (class 9–12)",
      "Direct Benefit Transfer to your bank account",
      "Reduces dropouts at the secondary level",
    ],
    requiredDocuments: [
      "NMMSS exam selection letter",
      "Class 8 mark sheet (≥ 55%)",
      "Income certificate (≤ ₹3.5 lakh)",
      "Aadhaar card",
      "Bonafide from school",
      "Bank passbook",
    ],
    applySteps: [
      "Appear in NMMSS state-level exam in class 8",
      "If selected, register on scholarships.gov.in",
      "Select 'National Means-cum-Merit Scholarship'",
      "Fill academic, family and bank details",
      "Upload supporting documents and submit",
    ],
    officialLink: "https://scholarships.gov.in",
    applicableStates: [],
    tags: ["scholarship", "secondary-school", "low-income"],
    eligibilityRules: [
      { field: "isStudent", operator: "true", label: "You are a school student" },
      { field: "age", operator: "gte", value: 13, label: "You are class 9 or above" },
      { field: "age", operator: "lte", value: 18, label: "You are class 12 or below" },
      {
        field: "annualIncome",
        operator: "lte",
        value: 350000,
        label: "Family income is below ₹3.5 lakh",
      },
    ],
    eligibilitySummary:
      "Meritorious class 9–12 students from families with income up to ₹3.5 lakh.",
    popularity: 64,
  },
  {
    slug: "pm-matru-vandana-yojana",
    name: "Pradhan Mantri Matru Vandana Yojana",
    nameHindi: "प्रधानमंत्री मातृ वंदना योजना",
    category: "women",
    ministry: "Ministry of Women & Child Development",
    shortDescription:
      "₹5,000 cash benefit for first child and ₹6,000 for second girl child.",
    description:
      "PMMVY is a maternity benefit programme that provides ₹5,000 in two instalments to pregnant and lactating mothers for their first living child, and ₹6,000 for the birth of a second girl child, to compensate for wage loss and support nutrition.",
    benefits: [
      "₹5,000 for first child in two instalments",
      "Additional ₹6,000 if the second child is a girl",
      "Direct Benefit Transfer to mother's bank account",
      "Encourages institutional delivery and immunisation",
    ],
    requiredDocuments: [
      "Mother and Child Protection (MCP) card",
      "Aadhaar of mother and husband",
      "Bank account details (Aadhaar-linked, in mother's name)",
      "Husband's identity proof",
    ],
    applySteps: [
      "Visit your nearest Anganwadi Centre or government health facility",
      "Fill PMMVY forms 1A, 1B and 1C as per stage of pregnancy",
      "Submit MCP card and Aadhaar copies",
      "First instalment after early registration of pregnancy",
      "Second instalment after child's first immunisation",
    ],
    officialLink: "https://pmmvy.wcd.gov.in",
    applicableStates: [],
    tags: ["women", "maternity", "girl-child", "dbt"],
    eligibilityRules: [
      { field: "gender", operator: "eq", value: "female", label: "You are a woman" },
      { field: "age", operator: "gte", value: 19, label: "You are 19 years or older" },
    ],
    eligibilitySummary:
      "Pregnant and lactating mothers (excluding government employees) for the first living child.",
    popularity: 82,
  },
  {
    slug: "janani-suraksha-yojana",
    name: "Janani Suraksha Yojana",
    nameHindi: "जननी सुरक्षा योजना",
    category: "healthcare",
    ministry: "Ministry of Health & Family Welfare",
    shortDescription:
      "Cash assistance for institutional delivery to reduce maternal and infant mortality.",
    description:
      "JSY is a safe-motherhood intervention under the National Health Mission. It provides cash assistance to pregnant women from poor households who deliver in a government or accredited private health facility, to encourage institutional delivery.",
    benefits: [
      "₹1,400 (rural) / ₹1,000 (urban) for institutional delivery in low-performing states",
      "₹700 (rural) / ₹600 (urban) in high-performing states",
      "ASHA worker assistance and incentive for accompanying mother",
      "Free transport to and from the health facility",
    ],
    requiredDocuments: [
      "JSY card / MCP card",
      "Aadhaar card",
      "BPL ration card",
      "Bank passbook",
      "Discharge slip from the hospital",
    ],
    applySteps: [
      "Register your pregnancy with the local ASHA worker",
      "Get the JSY / MCP card filled at the Anganwadi or PHC",
      "Deliver at a government or accredited private hospital",
      "Submit discharge slip and bank details to the hospital",
      "Receive the cash benefit via DBT after delivery",
    ],
    officialLink: "https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309",
    applicableStates: [],
    tags: ["healthcare", "women", "maternity", "low-income"],
    eligibilityRules: [
      { field: "gender", operator: "eq", value: "female", label: "You are a woman" },
      {
        field: "annualIncome",
        operator: "lte",
        value: 200000,
        label: "Family income falls within BPL bracket",
      },
    ],
    eligibilitySummary:
      "Pregnant women from BPL households who deliver in government or accredited facilities.",
    popularity: 78,
  },
  {
    slug: "pm-jan-aushadhi",
    name: "PM Bhartiya Janaushadhi Pariyojana",
    nameHindi: "प्रधानमंत्री भारतीय जनऔषधि परियोजना",
    category: "healthcare",
    ministry: "Department of Pharmaceuticals",
    shortDescription:
      "Quality generic medicines at 50–80% below market price across India.",
    description:
      "PMBJP makes affordable, quality generic medicines available through dedicated Janaushadhi Kendras across India. Anyone can buy at these stores — making essential medicines drastically cheaper for daily and chronic illness.",
    benefits: [
      "Medicines at 50–80% lower price than branded equivalents",
      "Over 2,000 medicines and 300 surgical items covered",
      "Quality assured under WHO-GMP standards",
      "11,000+ outlets nationwide and growing",
    ],
    requiredDocuments: [
      "Doctor's prescription",
      "No other documents needed for purchase",
    ],
    applySteps: [
      "Find your nearest Janaushadhi Kendra on janaushadhi.gov.in or the app",
      "Carry your prescription to the store",
      "Ask for the generic equivalent of your branded medicine",
      "Pay the listed price — significantly lower than the brand",
      "Keep the receipt for any return or insurance claim",
    ],
    officialLink: "https://janaushadhi.gov.in",
    applicableStates: [],
    tags: ["healthcare", "medicines", "affordable"],
    eligibilityRules: [],
    eligibilitySummary:
      "Open to everyone — no eligibility requirement. Just walk in with a prescription.",
    popularity: 70,
  },
  {
    slug: "mgnrega",
    name: "Mahatma Gandhi NREGA",
    nameHindi: "महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम",
    category: "employment",
    ministry: "Ministry of Rural Development",
    shortDescription:
      "Guaranteed 100 days of paid wage employment per year for rural households.",
    description:
      "MGNREGA legally guarantees 100 days of paid manual work per financial year to every rural household whose adult members volunteer to do unskilled work, thereby creating a safety net against rural poverty.",
    benefits: [
      "100 days of guaranteed wage employment per year",
      "Statutory daily wage (₹250–₹375 depending on state)",
      "Wages paid directly into Aadhaar-linked bank account within 15 days",
      "Unemployment allowance if work is not provided in 15 days",
      "Work site within 5 km of residence",
    ],
    requiredDocuments: [
      "Aadhaar card of all adult members",
      "Proof of residence in rural area",
      "Bank or post office account passbook",
      "Passport-size photographs",
    ],
    applySteps: [
      "Apply for a Job Card at your Gram Panchayat",
      "Submit Aadhaar, address proof and photographs",
      "Receive your MGNREGA Job Card within 15 days",
      "Apply for work in writing whenever you need it",
      "Track wages and work days on nrega.nic.in",
    ],
    officialLink: "https://nrega.nic.in",
    applicableStates: [],
    tags: ["employment", "rural", "wage", "low-income"],
    eligibilityRules: [
      { field: "age", operator: "gte", value: 18, label: "You are 18 years or older" },
      {
        field: "employmentStatus",
        operator: "in",
        value: ["unemployed", "self_employed"],
        label: "You are seeking unskilled wage work in your village",
      },
    ],
    eligibilitySummary:
      "Adult members of any rural household willing to do unskilled manual work.",
    popularity: 90,
  },
  {
    slug: "pm-mudra-yojana",
    name: "Pradhan Mantri MUDRA Yojana",
    nameHindi: "प्रधानमंत्री मुद्रा योजना",
    category: "employment",
    ministry: "Ministry of Finance",
    shortDescription:
      "Collateral-free business loans up to ₹20 lakh for micro-entrepreneurs.",
    description:
      "PMMY provides loans up to ₹20 lakh through banks, NBFCs and MFIs to small and micro businesses in non-farm income-generating activities. Three categories — Shishu (≤₹50,000), Kishore (₹50k–₹5 lakh), Tarun (₹5–10 lakh) and Tarun Plus (₹10–20 lakh).",
    benefits: [
      "Loans up to ₹20 lakh without collateral",
      "Available through any commercial / cooperative / regional rural bank",
      "MUDRA debit card (RuPay) for working capital withdrawal",
      "Lower interest rates and government credit guarantee",
      "Special focus on women, SC/ST and minorities",
    ],
    requiredDocuments: [
      "Aadhaar and PAN card",
      "Business proof (registration / GST / utility bill of shop)",
      "Bank statement of last 6 months",
      "Quotation of machinery / project report",
      "Recent passport-size photographs",
    ],
    applySteps: [
      "Visit udyamimitra.in or your nearest bank branch",
      "Choose the loan category (Shishu / Kishore / Tarun)",
      "Fill the MUDRA loan application form",
      "Submit business plan and supporting documents",
      "Bank disburses loan after verification (typically within 7–15 days)",
    ],
    officialLink: "https://www.mudra.org.in",
    applicableStates: [],
    tags: ["employment", "business", "loan", "self-employment"],
    eligibilityRules: [
      { field: "age", operator: "gte", value: 18, label: "You are 18 years or older" },
      {
        field: "employmentStatus",
        operator: "in",
        value: ["self_employed", "unemployed", "employed"],
        label: "You run or want to start a small / micro business",
      },
    ],
    eligibilitySummary:
      "Indian residents aged 18+ engaged in or planning a non-farm income-generating activity.",
    popularity: 85,
  },
  {
    slug: "pm-svanidhi",
    name: "PM SVANidhi (Street Vendors)",
    nameHindi: "पीएम स्वनिधि योजना",
    category: "employment",
    ministry: "Ministry of Housing & Urban Affairs",
    shortDescription:
      "Collateral-free working capital loans of ₹10,000 to ₹50,000 for street vendors.",
    description:
      "PM SVANidhi provides micro-credit to street vendors so they can restart their livelihoods after the pandemic. Loans are tenured 12 months and can be enhanced from ₹10,000 to ₹20,000 to ₹50,000 on timely repayment, with 7% interest subsidy and cashback for digital transactions.",
    benefits: [
      "First loan of ₹10,000, then ₹20,000, then ₹50,000 on timely repayment",
      "7% interest subsidy credited every 6 months",
      "Cashback up to ₹1,200 per year for digital payments",
      "Builds a formal credit history with credit bureaus",
    ],
    requiredDocuments: [
      "Vendor identity card / Letter of Recommendation from ULB",
      "Aadhaar card",
      "Bank account details",
      "Recent photograph",
    ],
    applySteps: [
      "Visit pmsvanidhi.mohua.gov.in or any participating bank / CSC",
      "Fill the simple application form",
      "Upload vendor ID or apply for an LoR through your municipality",
      "Submit Aadhaar and bank details",
      "Loan disbursed within 30 days of approval",
    ],
    officialLink: "https://pmsvanidhi.mohua.gov.in",
    applicableStates: [],
    tags: ["employment", "street-vendor", "loan", "low-income"],
    eligibilityRules: [
      { field: "age", operator: "gte", value: 18, label: "You are 18 years or older" },
      {
        field: "employmentStatus",
        operator: "in",
        value: ["self_employed", "unemployed"],
        label: "You are a street vendor or hawker in an urban area",
      },
    ],
    eligibilitySummary:
      "Urban street vendors with a vendor ID or LoR from their Urban Local Body.",
    popularity: 72,
  },
  {
    slug: "stand-up-india",
    name: "Stand Up India",
    nameHindi: "स्टैंड अप इंडिया",
    category: "employment",
    ministry: "Ministry of Finance",
    shortDescription:
      "₹10 lakh to ₹1 crore loan for SC, ST and women entrepreneurs.",
    description:
      "Stand Up India facilitates bank loans between ₹10 lakh and ₹1 crore to at least one SC or ST and one woman borrower per bank branch for setting up a greenfield enterprise in manufacturing, services, agri-allied or trading sector.",
    benefits: [
      "Composite loan of ₹10 lakh to ₹1 crore",
      "Up to 85% project funding by the bank",
      "Repayment up to 7 years with 18-month moratorium",
      "Hand-holding for project planning, registration and accounting",
    ],
    requiredDocuments: [
      "Aadhaar, PAN and caste certificate (for SC/ST)",
      "Detailed project report",
      "Quotations for machinery and infrastructure",
      "Existing bank account details",
    ],
    applySteps: [
      "Register on standupmitra.in",
      "Choose 'Trainee Borrower' or 'Ready Borrower'",
      "Get hand-holding support to prepare your project",
      "Apply through any scheduled commercial bank",
      "Loan disbursed after due diligence and sanction",
    ],
    officialLink: "https://www.standupmitra.in",
    applicableStates: [],
    tags: ["employment", "women", "sc", "st", "loan", "entrepreneur"],
    eligibilityRules: [
      { field: "age", operator: "gte", value: 18, label: "You are 18 years or older" },
      {
        field: "employmentStatus",
        operator: "in",
        value: ["self_employed", "unemployed", "employed"],
        label: "You want to start a greenfield enterprise",
      },
    ],
    eligibilitySummary:
      "SC, ST and women entrepreneurs aged 18+ starting a new manufacturing, services, agri-allied or trading enterprise.",
    popularity: 65,
  },
  {
    slug: "pm-fasal-bima-yojana",
    name: "Pradhan Mantri Fasal Bima Yojana",
    nameHindi: "प्रधानमंत्री फसल बीमा योजना",
    category: "agriculture",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    shortDescription:
      "Crop insurance against natural calamities at very low premium.",
    description:
      "PMFBY provides comprehensive crop insurance against natural calamities, pests and diseases. Farmer pays only 2% of sum insured for kharif, 1.5% for rabi and 5% for commercial / horticultural crops — the rest is paid by the government.",
    benefits: [
      "Comprehensive cover for prevented sowing, mid-season adversity and post-harvest losses",
      "Premium as low as 2% of sum insured for farmers",
      "Quick claim settlement directly into Aadhaar-linked bank account",
      "Voluntary for all farmers (loanee + non-loanee)",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Land ownership records (Khasra / Khatauni)",
      "Sowing certificate",
      "Bank passbook",
      "Crop area and crop name details",
    ],
    applySteps: [
      "Visit pmfby.gov.in or your nearest bank, CSC or insurance agent",
      "Fill the application with land and crop details",
      "Pay your share of the premium",
      "Get the policy document and SMS confirmation",
      "Report any crop loss within 72 hours via the Crop Insurance app",
    ],
    officialLink: "https://pmfby.gov.in",
    applicableStates: [],
    tags: ["agriculture", "farmer", "insurance", "crop"],
    eligibilityRules: [
      { field: "isFarmer", operator: "true", label: "You are a farmer cultivating notified crops" },
    ],
    eligibilitySummary:
      "All farmers (loanee and non-loanee) growing notified crops in notified areas.",
    popularity: 80,
  },
  {
    slug: "kisan-credit-card",
    name: "Kisan Credit Card (KCC)",
    nameHindi: "किसान क्रेडिट कार्ड",
    category: "agriculture",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    shortDescription:
      "Cheap, flexible credit up to ₹3 lakh for farm and allied activities.",
    description:
      "KCC provides a single window for farmers to get short-term credit for crop production, post-harvest expenses and consumption, plus working capital for animal husbandry and fisheries. Interest rate is just 4% per annum on prompt repayment up to ₹3 lakh.",
    benefits: [
      "Loan limit up to ₹3 lakh at 4% interest with timely repayment",
      "Covers crops, animal husbandry, fisheries and allied activities",
      "RuPay debit card and ATM access",
      "Insurance cover for the farmer included",
    ],
    requiredDocuments: [
      "Aadhaar and PAN card",
      "Land ownership / cultivation records",
      "Two recent passport-size photographs",
      "Existing bank account details",
    ],
    applySteps: [
      "Visit your nearest commercial / cooperative / RRB branch or apply via PM Kisan portal",
      "Fill the simple one-page KCC form",
      "Submit Aadhaar, land records and photos",
      "Bank issues KCC and RuPay card within 14 days",
      "Use the card to draw credit as per your needs",
    ],
    officialLink: "https://pmkisan.gov.in/Documents/Kcc.pdf",
    applicableStates: [],
    tags: ["agriculture", "farmer", "credit", "loan"],
    eligibilityRules: [
      { field: "isFarmer", operator: "true", label: "You are a farmer with cultivable land" },
      { field: "age", operator: "gte", value: 18, label: "You are 18 years or older" },
    ],
    eligibilitySummary:
      "All farmers, tenant farmers, sharecroppers and SHGs of farmers aged 18+.",
    popularity: 78,
  },
  {
    slug: "pm-ujjwala-yojana",
    name: "Pradhan Mantri Ujjwala Yojana",
    nameHindi: "प्रधानमंत्री उज्ज्वला योजना",
    category: "other",
    ministry: "Ministry of Petroleum & Natural Gas",
    shortDescription:
      "Free LPG connection with stove for women from low-income families.",
    description:
      "PMUY provides a free LPG connection along with a security deposit, gas stove and first refill to adult women from poor households, replacing polluting cooking fuels like wood and kerosene with clean LPG.",
    benefits: [
      "Free LPG connection in the woman's name",
      "₹1,600 financial assistance (deposit + first refill + stove)",
      "₹300 per cylinder subsidy for up to 12 refills per year",
      "Healthier indoor environment and saves time on fuel collection",
    ],
    requiredDocuments: [
      "Aadhaar of woman applicant",
      "BPL ration card or SECC verification",
      "Bank passbook (Aadhaar-linked)",
      "Recent photograph",
    ],
    applySteps: [
      "Download the KYC form from pmuy.gov.in or visit any LPG distributor",
      "Submit Aadhaar, ration card and bank details",
      "Choose your preferred LPG company (Indane / Bharat / HP)",
      "Receive your free connection and stove within 7–15 days",
      "Refills with subsidy credited automatically to your bank account",
    ],
    officialLink: "https://www.pmuy.gov.in",
    applicableStates: [],
    tags: ["women", "lpg", "clean-fuel", "low-income"],
    eligibilityRules: [
      { field: "gender", operator: "eq", value: "female", label: "You are a woman" },
      { field: "age", operator: "gte", value: 18, label: "You are 18 years or older" },
      {
        field: "annualIncome",
        operator: "lte",
        value: 250000,
        label: "Family income falls in low-income bracket",
      },
    ],
    eligibilitySummary:
      "Adult women from poor households (SECC / BPL / 14-point criteria) without an existing LPG connection.",
    popularity: 88,
  },
  {
    slug: "pm-surya-ghar",
    name: "PM Surya Ghar Muft Bijli Yojana",
    nameHindi: "पीएम सूर्य घर मुफ्त बिजली योजना",
    category: "other",
    ministry: "Ministry of New & Renewable Energy",
    shortDescription:
      "Up to 300 units of free electricity per month via subsidised rooftop solar.",
    description:
      "PM Surya Ghar offers subsidies of up to ₹78,000 to install rooftop solar panels on residential buildings — enabling households to generate their own electricity, get up to 300 free units per month and sell surplus power back to the grid.",
    benefits: [
      "Subsidy of ₹30k / ₹60k / ₹78k for 1 / 2 / 3+ kW systems",
      "Up to 300 units of free electricity per month",
      "Income from selling surplus power back to the grid",
      "Collateral-free loans up to ₹2 lakh at 7% interest",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Latest electricity bill",
      "Property ownership document",
      "Bank passbook",
      "Recent photograph",
    ],
    applySteps: [
      "Register on pmsuryaghar.gov.in with your state and DISCOM details",
      "Submit consumer number and roof details",
      "Apply for feasibility approval from your DISCOM",
      "Get installation done by an empanelled vendor",
      "Apply for net-metering and receive the subsidy in your bank",
    ],
    officialLink: "https://pmsuryaghar.gov.in",
    applicableStates: [],
    tags: ["solar", "electricity", "subsidy", "energy"],
    eligibilityRules: [
      { field: "age", operator: "gte", value: 18, label: "You are 18 years or older" },
    ],
    eligibilitySummary:
      "Any Indian household that owns a roof and has a valid electricity connection.",
    popularity: 75,
  },
  {
    slug: "pm-suraksha-bima",
    name: "PM Suraksha Bima Yojana",
    nameHindi: "पीएम सुरक्षा बीमा योजना",
    category: "other",
    ministry: "Ministry of Finance",
    shortDescription:
      "₹2 lakh accident insurance for just ₹20 per year.",
    description:
      "PMSBY is a one-year accident insurance scheme renewable annually, providing ₹2 lakh on accidental death or full disability and ₹1 lakh on partial disability — at a premium of just ₹20 per year, auto-debited from your bank account.",
    benefits: [
      "₹2 lakh on accidental death or full permanent disability",
      "₹1 lakh on partial permanent disability",
      "Annual premium of just ₹20",
      "Auto-renewal each year via bank account",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Active savings bank account",
      "Mobile number linked to bank",
      "Nominee details",
    ],
    applySteps: [
      "Visit your bank or use net banking / mobile banking",
      "Opt-in for PMSBY by giving consent for ₹20 auto-debit",
      "Enter nominee details in the form",
      "Receive a confirmation SMS with your insurance number",
      "Coverage starts on the day of debit and is renewed every June 1",
    ],
    officialLink: "https://www.jansuraksha.gov.in",
    applicableStates: [],
    tags: ["insurance", "accident", "low-cost"],
    eligibilityRules: [
      { field: "age", operator: "gte", value: 18, label: "You are 18 years or older" },
      { field: "age", operator: "lte", value: 70, label: "You are under 70 years of age" },
    ],
    eligibilitySummary:
      "Indian residents aged 18–70 with a savings bank account.",
    popularity: 78,
  },
  {
    slug: "pm-jeevan-jyoti-bima",
    name: "PM Jeevan Jyoti Bima Yojana",
    nameHindi: "पीएम जीवन ज्योति बीमा योजना",
    category: "other",
    ministry: "Ministry of Finance",
    shortDescription:
      "₹2 lakh life insurance cover for just ₹436 per year.",
    description:
      "PMJJBY is a one-year renewable life insurance scheme that pays ₹2 lakh to the nominee on the death of the insured for any reason, at a tiny annual premium of ₹436 auto-debited from the bank account.",
    benefits: [
      "₹2 lakh life cover for any cause of death",
      "Annual premium of only ₹436",
      "Auto-renewal each year via bank account",
      "Available to all bank account holders aged 18–50",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Active savings bank account",
      "Mobile number linked to bank",
      "Nominee details and good health declaration",
    ],
    applySteps: [
      "Visit your bank or use net banking / mobile banking",
      "Opt-in for PMJJBY with ₹436 auto-debit consent",
      "Submit nominee details and self-declaration of good health",
      "Receive a confirmation SMS with your insurance number",
      "Coverage runs from June 1 to May 31 each year",
    ],
    officialLink: "https://www.jansuraksha.gov.in",
    applicableStates: [],
    tags: ["insurance", "life", "low-cost"],
    eligibilityRules: [
      { field: "age", operator: "gte", value: 18, label: "You are 18 years or older" },
      { field: "age", operator: "lte", value: 50, label: "You are under 50 years of age" },
    ],
    eligibilitySummary:
      "Indian residents aged 18–50 with a savings bank account.",
    popularity: 76,
  },
  {
    slug: "atal-pension-yojana",
    name: "Atal Pension Yojana",
    nameHindi: "अटल पेंशन योजना",
    category: "pension",
    ministry: "Ministry of Finance",
    shortDescription:
      "Guaranteed monthly pension of ₹1,000 to ₹5,000 after age 60.",
    description:
      "APY is a government-guaranteed pension scheme primarily for unorganised-sector workers. Subscribers between 18–40 contribute every month and receive a fixed monthly pension of ₹1,000 / ₹2,000 / ₹3,000 / ₹4,000 or ₹5,000 from age 60 for life.",
    benefits: [
      "Choice of fixed pension between ₹1,000 and ₹5,000 per month",
      "Same pension to spouse after subscriber's death",
      "Return of accumulated corpus to nominee after both deaths",
      "Government guarantee of pension amount",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Active savings bank or post office account",
      "Mobile number linked to bank",
      "Nominee details",
    ],
    applySteps: [
      "Visit your bank, post office or net banking and choose APY",
      "Decide your target monthly pension and start age",
      "Set up auto-debit for the monthly contribution",
      "Receive a Permanent Retirement Account Number (PRAN)",
      "Pension begins automatically after you turn 60",
    ],
    officialLink: "https://www.npscra.nsdl.co.in/scheme-details.php",
    applicableStates: [],
    tags: ["pension", "savings", "unorganised-sector"],
    eligibilityRules: [
      { field: "age", operator: "gte", value: 18, label: "You are 18 years or older" },
      { field: "age", operator: "lte", value: 40, label: "You are under 40 years of age" },
    ],
    eligibilitySummary:
      "Indian residents aged 18–40 with a savings bank account, primarily unorganised-sector workers.",
    popularity: 70,
  },
  {
    slug: "rashtriya-vayoshri-yojana",
    name: "Rashtriya Vayoshri Yojana",
    nameHindi: "राष्ट्रीय वयोश्री योजना",
    category: "pension",
    ministry: "Ministry of Social Justice & Empowerment",
    shortDescription:
      "Free assistive devices (walker, hearing aid, dentures) for BPL senior citizens.",
    description:
      "RVY provides aids and assistive living devices like walking sticks, walkers, wheelchairs, hearing aids, spectacles, dentures and tripods free of cost to senior citizens (60+) belonging to BPL category, restoring their independence and quality of life.",
    benefits: [
      "Free walking sticks, walkers, wheelchairs and tripods",
      "Free hearing aids, spectacles and dentures",
      "Distributed in special camps near your home",
      "1-year warranty and repair support",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Age proof (60+)",
      "BPL ration card or income certificate",
      "Medical assessment of disability / impairment",
    ],
    applySteps: [
      "Watch for RVY camp announcements in your district / panchayat",
      "Visit the camp with Aadhaar and BPL proof",
      "Get assessed by the medical team",
      "Receive the prescribed assistive device free of cost",
    ],
    officialLink: "https://alimco.in/rvy-scheme.aspx",
    applicableStates: [],
    tags: ["senior-citizen", "elderly", "assistive-devices", "low-income"],
    eligibilityRules: [
      { field: "isSeniorCitizen", operator: "true", label: "You are a senior citizen (60+)" },
      {
        field: "annualIncome",
        operator: "lte",
        value: 200000,
        label: "Family income falls within BPL bracket",
      },
    ],
    eligibilitySummary:
      "Senior citizens aged 60+ from BPL households who need assistive living devices.",
    popularity: 60,
  },
  {
    slug: "adip-disability-aids",
    name: "ADIP Scheme — Aids & Appliances for Divyangjan",
    nameHindi: "एडीआईपी योजना",
    category: "disability",
    ministry: "Ministry of Social Justice & Empowerment",
    shortDescription:
      "Free or subsidised aids like wheelchairs, prosthetics and hearing aids.",
    description:
      "ADIP assists persons with disabilities by providing modern, scientifically-manufactured aids and appliances — wheelchairs, tricycles, prosthetic limbs, hearing aids, smart canes and more — either free or with subsidy depending on family income.",
    benefits: [
      "100% subsidy if monthly income ≤ ₹22,500",
      "50% subsidy if monthly income is ₹22,501–₹30,000",
      "Aids include wheelchairs, prosthetics, hearing aids, Braille kits and smart canes",
      "Distributed through ALIMCO and other empanelled agencies",
    ],
    requiredDocuments: [
      "Disability certificate (40% or more)",
      "Aadhaar card",
      "Income certificate",
      "Recent passport-size photographs",
      "Recommendation from authorised medical officer",
    ],
    applySteps: [
      "Apply at the nearest ALIMCO camp, DDRC or empanelled NGO",
      "Get the assessment done by the medical team",
      "Submit disability certificate, income proof and Aadhaar",
      "Get the prescribed device measured and fitted",
      "Receive the device free or at subsidised cost",
    ],
    officialLink: "https://disabilityaffairs.gov.in/content/page/adip.php",
    applicableStates: [],
    tags: ["disability", "divyangjan", "assistive-devices"],
    eligibilityRules: [
      { field: "hasDisability", operator: "true", label: "You hold a disability certificate" },
      {
        field: "annualIncome",
        operator: "lte",
        value: 360000,
        label: "Family income is within ADIP slab (~₹30k/month)",
      },
    ],
    eligibilitySummary:
      "Persons with 40% or more disability with monthly income up to ₹30,000.",
    popularity: 58,
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

  // ============================================================
  // Additional Central Government schemes
  // ============================================================
  {
    slug: "pm-vishwakarma",
    name: "PM Vishwakarma Yojana",
    nameHindi: "पीएम विश्वकर्मा योजना",
    category: "employment",
    ministry: "Ministry of MSME",
    shortDescription:
      "End-to-end support for traditional artisans and craftspeople — recognition, skill, toolkit, credit and market linkage.",
    description:
      "PM Vishwakarma is a Central Sector Scheme launched in 2023 to provide holistic support to artisans and craftspeople working with their hands and tools across 18 trades — including carpenters, blacksmiths, goldsmiths, potters, sculptors, cobblers, tailors, masons, washermen, barbers, fishing-net makers and more. Beneficiaries get a Vishwakarma certificate and ID card, basic and advanced skill training with a stipend, a toolkit incentive of Rs 15,000, collateral-free credit up to Rs 3 lakh at 5% interest, and digital transactions and marketing support.",
    benefits: [
      "Recognition through PM Vishwakarma certificate and ID card",
      "Skill training with Rs 500 per day stipend",
      "Toolkit incentive of Rs 15,000",
      "Collateral-free loan up to Rs 1 lakh (1st tranche) and Rs 2 lakh (2nd) at 5%",
      "Incentive for digital transactions",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Mobile number linked to Aadhaar",
      "Bank account details",
      "Ration card",
      "Caste / category certificate (if applicable)",
    ],
    applySteps: [
      "Visit a Common Service Centre (CSC) with your Aadhaar and bank details",
      "Get registered under one of the 18 trades on pmvishwakarma.gov.in",
      "Complete three-step verification by Gram Panchayat / ULB and District",
      "Attend Basic Skill Training and claim toolkit voucher",
      "Apply for credit through partner banks",
    ],
    officialLink: "https://pmvishwakarma.gov.in",
    applicableStates: [],
    tags: ["artisan", "craftsman", "msme", "loan", "skill", "toolkit"],
    eligibilityRules: [
      { field: "age", operator: "gte", value: 18, label: "You are 18 years or older" },
      { field: "employmentStatus", operator: "in", value: ["self_employed", "unemployed"], label: "You are an artisan or craftsperson" },
    ],
    eligibilitySummary:
      "Traditional artisans and craftspeople in 18 listed trades, aged 18+, who use hands and tools.",
    popularity: 82,
  },

  {
    slug: "pm-kisan-maandhan",
    name: "PM Kisan Maan-Dhan Yojana",
    nameHindi: "पीएम किसान मानधन योजना",
    category: "pension",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    shortDescription:
      "Voluntary pension scheme for small and marginal farmers — Rs 3,000 monthly pension after age 60.",
    description:
      "PM-KMY is a contributory pension scheme for small and marginal farmers (with cultivable land up to 2 hectares). Farmers aged 18–40 contribute Rs 55–200 per month till age 60, with the Government of India contributing an equal amount. On reaching 60, the farmer receives a guaranteed minimum pension of Rs 3,000 per month for life. Spouse gets 50% family pension on death of the farmer.",
    benefits: [
      "Guaranteed Rs 3,000 monthly pension from age 60",
      "Equal monthly contribution by Government of India",
      "Family pension of 50% to spouse on death of farmer",
      "Exit option with interest at any time",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Savings bank account or PM-Kisan account",
      "Land record / Khasra-Khatauni",
    ],
    applySteps: [
      "Visit nearest Common Service Centre (CSC)",
      "Provide Aadhaar, bank details and land documents",
      "Auto-debit mandate is set up for monthly contribution",
      "Receive Kisan Pension Account Number (KPAN) and PM-KMY card",
    ],
    officialLink: "https://maandhan.in/scheme/pmkmy",
    applicableStates: [],
    tags: ["farmer", "pension", "small-farmer", "old-age", "contributory"],
    eligibilityRules: [
      { field: "isFarmer", operator: "true", label: "You are a small or marginal farmer (≤ 2 ha land)" },
      { field: "age", operator: "gte", value: 18, label: "You are 18 years or older" },
      { field: "age", operator: "lte", value: 40, label: "You are not older than 40" },
    ],
    eligibilitySummary:
      "Small and marginal farmers (cultivable land up to 2 hectares) aged between 18 and 40 years.",
    popularity: 70,
  },

  {
    slug: "e-shram",
    name: "e-Shram Card (National Database of Unorganised Workers)",
    nameHindi: "ई-श्रम कार्ड",
    category: "employment",
    ministry: "Ministry of Labour & Employment",
    shortDescription:
      "Free Universal Account Number card for unorganised sector workers, opening doors to social security benefits.",
    description:
      "e-Shram is the first ever national database of unorganised workers — including construction workers, migrant labourers, gig and platform workers, street vendors, domestic workers, agricultural workers, MGNREGA workers and more. Registration is free and provides a 12-digit Universal Account Number (UAN). Cardholders are auto-enrolled for Pradhan Mantri Suraksha Bima Yojana for the first year (Rs 2 lakh accidental cover) and become eligible for future targeted schemes.",
    benefits: [
      "Free 12-digit Universal Account Number (UAN) e-Shram card",
      "Accidental insurance cover of Rs 2 lakh under PMSBY (first year free)",
      "Single platform to receive future welfare scheme benefits",
      "Portable identity across states for migrant workers",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Mobile number linked with Aadhaar",
      "Bank account details (IFSC and account number)",
    ],
    applySteps: [
      "Visit eshram.gov.in or nearest CSC",
      "Enter Aadhaar-linked mobile number and verify OTP",
      "Fill personal, occupation, address and bank details",
      "Download and save the e-Shram card",
    ],
    officialLink: "https://eshram.gov.in",
    applicableStates: [],
    tags: ["unorganised", "labour", "worker", "migrant", "gig", "construction"],
    eligibilityRules: [
      { field: "age", operator: "gte", value: 16, label: "You are between 16 and 59 years old" },
      { field: "age", operator: "lte", value: 59, label: "You are not yet 60" },
      { field: "employmentStatus", operator: "in", value: ["employed", "self_employed", "unemployed"], label: "You work in the unorganised sector" },
    ],
    eligibilitySummary:
      "Any unorganised sector worker aged 16–59 not covered by EPFO/ESIC and not paying income tax.",
    popularity: 88,
  },

  {
    slug: "pmegp",
    name: "Prime Minister's Employment Generation Programme (PMEGP)",
    nameHindi: "प्रधानमंत्री रोजगार सृजन कार्यक्रम",
    category: "employment",
    ministry: "Ministry of MSME",
    shortDescription:
      "Credit-linked subsidy programme to set up new micro-enterprises in manufacturing or service sector.",
    description:
      "PMEGP, implemented by KVIC, helps unemployed youth and traditional artisans set up new micro-enterprises. Project cost up to Rs 50 lakh (manufacturing) and Rs 20 lakh (service) is eligible. Margin money subsidy ranges from 15% (general / urban) up to 35% (special category / rural).",
    benefits: [
      "Project loan up to Rs 50 lakh for manufacturing units",
      "Project loan up to Rs 20 lakh for service units",
      "Margin money subsidy of 15%–35% of project cost",
      "Mandatory EDP training before disbursal",
    ],
    requiredDocuments: [
      "Aadhaar card and PAN",
      "Educational qualification certificate",
      "Project report",
      "Caste / special category certificate (if applicable)",
      "Bank account details",
    ],
    applySteps: [
      "Apply online at kviconline.gov.in/pmegpeportal",
      "Upload project report and supporting documents",
      "Attend the District Task Force interview",
      "Complete EDP (Entrepreneurship Development Programme) training",
      "Receive sanction and disbursal from financing bank",
    ],
    officialLink: "https://www.kviconline.gov.in/pmegpeportal/jsp/pmegponline.jsp",
    applicableStates: [],
    tags: ["msme", "loan", "subsidy", "self-employment", "youth"],
    eligibilityRules: [
      { field: "age", operator: "gte", value: 18, label: "You are 18 years or older" },
      { field: "employmentStatus", operator: "in", value: ["unemployed", "self_employed"], label: "You want to start a new micro-enterprise" },
    ],
    eligibilitySummary:
      "Individuals aged 18+ wanting to set up a new micro-enterprise (existing units not eligible). 8th standard pass required for projects above Rs 10 lakh (mfg) or Rs 5 lakh (service).",
    popularity: 75,
  },

  {
    slug: "ddu-gky",
    name: "Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)",
    nameHindi: "दीनदयाल उपाध्याय ग्रामीण कौशल्य योजना",
    category: "employment",
    ministry: "Ministry of Rural Development",
    shortDescription:
      "Free placement-linked skill training for rural poor youth aged 15–35.",
    description:
      "DDU-GKY targets rural poor youth from BPL families and trains them in market-driven skills with assured placement. Training is free, fully residential or non-residential, and includes domain skills, soft skills, English and IT. Post-placement support and migration support are also provided.",
    benefits: [
      "Free skill training (residential or non-residential)",
      "Free uniforms, study material, food and lodging during training",
      "Placement in jobs with minimum prescribed wages",
      "Post-placement support of Rs 1,000–1,500/month for 3 months",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "BPL ration card or income proof",
      "Educational qualification certificate",
      "Bank account details",
    ],
    applySteps: [
      "Identify a DDU-GKY training centre via the Kaushal Bharat / state mission portal",
      "Submit application with documents",
      "Undergo selection and counselling",
      "Complete training and accept placement offer",
    ],
    officialLink: "https://ddugky.gov.in",
    applicableStates: [],
    tags: ["skill", "rural", "youth", "placement", "training", "free"],
    eligibilityRules: [
      { field: "age", operator: "gte", value: 15, label: "You are between 15 and 35 years old" },
      { field: "age", operator: "lte", value: 35, label: "You are not older than 35" },
      { field: "employmentStatus", operator: "in", value: ["unemployed", "student"], label: "You are a rural unemployed youth" },
    ],
    eligibilitySummary:
      "Rural poor youth aged 15–35 (45 for women / SC/ST/PwD/minorities). Family must be poor as per SECC or eligible criteria.",
    popularity: 70,
  },

  {
    slug: "pm-daksh",
    name: "PM-DAKSH Yojana",
    nameHindi: "पीएम-दक्ष योजना",
    category: "employment",
    ministry: "Ministry of Social Justice & Empowerment",
    shortDescription:
      "Free skill development and upskilling for SC, OBC, EBC, DNT and Safai Karamcharis.",
    description:
      "Pradhan Mantri Dakshta Aur Kushalta Sampann Hitgrahi (PM-DAKSH) provides skill development training in three formats: short-term Up-skilling/Re-skilling, Short Term Training and Long Term Training. Training is free with stipend for SC, OBC, EBC, De-Notified Tribes and Safai Karamcharis.",
    benefits: [
      "Free short-term and long-term skill training",
      "Stipend of Rs 1,500/month or Rs 3,000/month based on course",
      "Free study material, uniform and tool kit",
      "Placement assistance after training",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Caste / category certificate (SC/OBC/EBC/DNT)",
      "Income certificate (annual income < Rs 3 lakh)",
      "Bank account details",
    ],
    applySteps: [
      "Register on pmdaksh.dosje.gov.in or via PM-DAKSH mobile app",
      "Choose training centre and course",
      "Submit category and income certificates",
      "Attend training and receive stipend in bank account",
    ],
    officialLink: "https://pmdaksh.dosje.gov.in",
    applicableStates: [],
    tags: ["skill", "sc", "obc", "minority", "stipend", "training"],
    eligibilityRules: [
      { field: "age", operator: "gte", value: 18, label: "You are between 18 and 45 years old" },
      { field: "age", operator: "lte", value: 45, label: "You are not older than 45" },
      { field: "casteCategory", operator: "in", value: ["sc", "obc", "minority"], label: "You belong to SC, OBC, EBC, DNT or are a Safai Karamchari" },
      { field: "annualIncome", operator: "lt", value: 300000, label: "Family income below Rs 3 lakh per year" },
    ],
    eligibilitySummary:
      "SC/OBC/EBC/DNT/Safai Karamchari, aged 18–45, with family annual income below Rs 3 lakh.",
    popularity: 60,
  },

  {
    slug: "saubhagya",
    name: "Pradhan Mantri Sahaj Bijli Har Ghar Yojana (Saubhagya)",
    nameHindi: "सौभाग्य योजना",
    category: "other",
    ministry: "Ministry of Power",
    shortDescription:
      "Free electricity connection to all un-electrified households (poor families pay nothing).",
    description:
      "Saubhagya was launched to achieve universal household electrification by providing last-mile electricity connections to all un-electrified households in rural and urban areas. Poor families identified through SECC 2011 get the connection free of cost; others pay Rs 500 in 10 instalments via electricity bills. Includes wiring inside the house, energy meter, LED bulbs, fan and switch.",
    benefits: [
      "Free last-mile electricity connection for SECC poor households",
      "Rs 500 connection cost (in 10 instalments) for non-SECC families",
      "Includes meter, wiring, LED bulbs and fan",
      "Solar pack of 200–300 Wp for households in remote, ungridded areas",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Voter ID or any other photo identity",
      "Proof of residence",
      "SECC 2011 deprivation certificate (if applicable)",
    ],
    applySteps: [
      "Register on saubhagya.gov.in or contact nearest electricity DISCOM",
      "Submit identity and address documents",
      "DISCOM team carries out site survey and installation",
    ],
    officialLink: "https://saubhagya.gov.in",
    applicableStates: [],
    tags: ["electricity", "rural", "urban-poor", "free-connection"],
    eligibilityRules: [],
    eligibilitySummary:
      "Any un-electrified household in India. Free for SECC 2011 poor families; nominal cost for others.",
    popularity: 65,
  },

  {
    slug: "jal-jeevan-mission",
    name: "Jal Jeevan Mission (Har Ghar Jal)",
    nameHindi: "जल जीवन मिशन",
    category: "other",
    ministry: "Ministry of Jal Shakti",
    shortDescription:
      "Functional household tap water connection (FHTC) to every rural household by 2024.",
    description:
      "Jal Jeevan Mission is a flagship programme aimed at providing safe and adequate drinking water through individual household tap connections to all rural households. The mission focuses on ensuring 55 litres per capita per day of potable water at service level on regular and long-term basis.",
    benefits: [
      "Functional tap water connection inside every rural household",
      "55 litres per capita per day of safe drinking water",
      "Reduced drudgery for women and girls",
      "Community participation through Village Water & Sanitation Committee",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Proof of rural residence",
      "Ration card (if available)",
    ],
    applySteps: [
      "Approach the Gram Panchayat or Village Water & Sanitation Committee",
      "Get listed in the village action plan",
      "Connection is provided by State PHED / implementing agency",
    ],
    officialLink: "https://jaljeevanmission.gov.in",
    applicableStates: [],
    tags: ["water", "rural", "tap-connection", "sanitation"],
    eligibilityRules: [],
    eligibilitySummary:
      "Every rural household in India is eligible for a Functional Household Tap Connection.",
    popularity: 70,
  },

  {
    slug: "swachh-bharat-toilet",
    name: "Swachh Bharat Mission – Individual Household Latrine (IHHL)",
    nameHindi: "स्वच्छ भारत मिशन - व्यक्तिगत घरेलू शौचालय",
    category: "other",
    ministry: "Ministry of Jal Shakti / Housing & Urban Affairs",
    shortDescription:
      "Subsidy of Rs 12,000 to construct an individual household toilet.",
    description:
      "Under SBM (Gramin) and SBM (Urban), eligible households without an individual toilet receive an incentive of Rs 12,000 (Centre + State share) for construction of a twin-pit toilet with water, hand-wash and ventilation. Aim is to make India Open Defecation Free (ODF) and ODF Plus.",
    benefits: [
      "Rs 12,000 incentive for construction of household toilet",
      "Twin-pit design for safe disposal",
      "Improved hygiene, dignity and women's safety",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Bank account details",
      "Proof of residence",
      "Photograph of existing premises (no toilet)",
    ],
    applySteps: [
      "Apply via Gram Panchayat (rural) or Urban Local Body (urban)",
      "Get site verified by sanitation officer",
      "Construct toilet as per design",
      "Receive incentive in bank after geo-tagged photo verification",
    ],
    officialLink: "https://swachhbharatmission.ddws.gov.in",
    applicableStates: [],
    tags: ["sanitation", "toilet", "subsidy", "swachh-bharat"],
    eligibilityRules: [],
    eligibilitySummary:
      "Households without an individual household toilet. Priority to BPL, SC/ST, women-headed households and PwDs.",
    popularity: 68,
  },

  {
    slug: "soil-health-card",
    name: "Soil Health Card Scheme",
    nameHindi: "मृदा स्वास्थ्य कार्ड योजना",
    category: "agriculture",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    shortDescription:
      "Free soil testing and personalised crop and fertiliser recommendations for every farm.",
    description:
      "The scheme provides every farmer with a Soil Health Card every two years. It contains the status of soil with respect to 12 parameters (N, P, K, S, micro-nutrients, pH, EC, OC) and gives personalised recommendations for nutrient and fertiliser dose for the crops to be grown.",
    benefits: [
      "Free soil testing every 2 years",
      "Personalised fertiliser and nutrient recommendations",
      "Reduces input cost and improves yield",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Land ownership / khasra documents",
    ],
    applySteps: [
      "Approach Krishi Vigyan Kendra or Agriculture Department",
      "Provide land details for soil sample collection",
      "Receive printed Soil Health Card with recommendations",
    ],
    officialLink: "https://soilhealth.dac.gov.in",
    applicableStates: [],
    tags: ["farmer", "soil", "agriculture", "free"],
    eligibilityRules: [
      { field: "isFarmer", operator: "true", label: "You are a farmer with cultivable land" },
    ],
    eligibilitySummary:
      "All farmers in India with cultivable land are eligible.",
    popularity: 50,
  },

  {
    slug: "pkvy-organic",
    name: "Paramparagat Krishi Vikas Yojana (PKVY)",
    nameHindi: "परंपरागत कृषि विकास योजना",
    category: "agriculture",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    shortDescription:
      "Financial assistance of Rs 50,000 per hectare over 3 years to adopt organic farming.",
    description:
      "PKVY promotes organic farming through Participatory Guarantee System (PGS) certification in clusters of 50 hectares or more. Farmers receive Rs 50,000 per hectare over 3 years for inputs, on-farm infrastructure, certification and marketing.",
    benefits: [
      "Rs 50,000 per hectare assistance over 3 years",
      "Free PGS-India organic certification",
      "Support for value addition and marketing",
      "Cluster-based extension and training",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Land ownership documents",
      "Bank account details",
    ],
    applySteps: [
      "Form a cluster of 50 hectares with at least 50 farmers",
      "Register through state Department of Agriculture",
      "Adopt organic practices as per PGS-India norms",
      "Receive assistance in DBT mode in three annual instalments",
    ],
    officialLink: "https://pgsindia-ncof.gov.in",
    applicableStates: [],
    tags: ["farmer", "organic", "agriculture", "subsidy"],
    eligibilityRules: [
      { field: "isFarmer", operator: "true", label: "You are a farmer" },
    ],
    eligibilitySummary:
      "Farmers willing to adopt organic farming in cluster mode of 50 hectares or more.",
    popularity: 48,
  },

  {
    slug: "pmksy",
    name: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
    nameHindi: "प्रधानमंत्री कृषि सिंचाई योजना",
    category: "agriculture",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    shortDescription:
      "Subsidy on micro-irrigation (drip & sprinkler) systems — 'Per Drop More Crop'.",
    description:
      "PMKSY's 'Per Drop More Crop' component provides up to 55% subsidy to small/marginal farmers and 45% to other farmers on the cost of drip and sprinkler irrigation systems. The scheme also covers watershed development and 'Har Khet Ko Pani' for assured irrigation.",
    benefits: [
      "55% subsidy for small/marginal farmers on micro-irrigation",
      "45% subsidy for other farmers",
      "Improved water use efficiency and yield",
      "Reduced power and labour costs",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Land ownership documents",
      "Bank account details",
      "Quotation from approved supplier",
    ],
    applySteps: [
      "Apply online at pmksy.gov.in or through district Horticulture office",
      "Get site survey done",
      "Install system through empanelled supplier",
      "Subsidy released to bank account after installation verification",
    ],
    officialLink: "https://pmksy.gov.in",
    applicableStates: [],
    tags: ["farmer", "irrigation", "subsidy", "drip", "sprinkler"],
    eligibilityRules: [
      { field: "isFarmer", operator: "true", label: "You are a farmer with own / leased land" },
    ],
    eligibilitySummary:
      "All farmers with cultivable land. Higher subsidy for small/marginal farmers and SC/ST/women.",
    popularity: 55,
  },

  {
    slug: "pm-jan-dhan",
    name: "Pradhan Mantri Jan Dhan Yojana (PMJDY)",
    nameHindi: "प्रधानमंत्री जन धन योजना",
    category: "other",
    ministry: "Department of Financial Services",
    shortDescription:
      "Zero-balance bank account with RuPay debit card, accident cover and overdraft facility.",
    description:
      "PMJDY is the National Mission for Financial Inclusion that ensures access to financial services such as a basic savings account, credit, insurance and pension to every household. Account holders get a zero-balance bank account, free RuPay debit card with Rs 2 lakh accidental insurance and overdraft up to Rs 10,000.",
    benefits: [
      "Zero-balance basic savings account",
      "Free RuPay debit card",
      "Accidental insurance cover of Rs 2 lakh",
      "Overdraft facility up to Rs 10,000 (after 6 months of satisfactory operation)",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Any one OVD (Voter ID, Passport, Driving Licence) if Aadhaar unavailable",
      "Recent passport-size photograph",
    ],
    applySteps: [
      "Visit any bank branch or Bank Mitra (Business Correspondent)",
      "Fill the PMJDY account opening form",
      "Submit Aadhaar / OVD",
      "Receive passbook and RuPay card",
    ],
    officialLink: "https://pmjdy.gov.in",
    applicableStates: [],
    tags: ["bank", "financial-inclusion", "savings", "rupay", "insurance"],
    eligibilityRules: [
      { field: "age", operator: "gte", value: 10, label: "You are 10 years or older" },
    ],
    eligibilitySummary:
      "Any Indian citizen aged 10+ who does not already have a bank account.",
    popularity: 90,
  },

  {
    slug: "naps-apprenticeship",
    name: "National Apprenticeship Promotion Scheme (NAPS)",
    nameHindi: "राष्ट्रीय शिक्षुता प्रोत्साहन योजना",
    category: "employment",
    ministry: "Ministry of Skill Development & Entrepreneurship",
    shortDescription:
      "Earn-while-you-learn apprenticeship with Government sharing 25% of stipend.",
    description:
      "NAPS promotes apprenticeship training in establishments. The Government reimburses 25% of the prescribed stipend (subject to a maximum of Rs 1,500 per month per apprentice) directly to the establishment. Apprentices gain industry experience and a certificate from the National Council for Vocational Education and Training.",
    benefits: [
      "Stipend during apprenticeship (25% reimbursed by Government)",
      "NCVET-recognised apprenticeship certificate",
      "On-the-job industry experience and improved employability",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Educational qualification certificates",
      "Bank account details",
    ],
    applySteps: [
      "Register as apprentice on apprenticeshipindia.gov.in",
      "Search and apply for apprenticeship opportunities",
      "Sign apprenticeship contract with employer",
      "Complete training and receive certificate",
    ],
    officialLink: "https://apprenticeshipindia.gov.in",
    applicableStates: [],
    tags: ["apprenticeship", "youth", "stipend", "training", "employment"],
    eligibilityRules: [
      { field: "age", operator: "gte", value: 14, label: "You are 14 years or older" },
      { field: "employmentStatus", operator: "in", value: ["unemployed", "student"], label: "You are looking for industry training" },
    ],
    eligibilitySummary:
      "Indian citizens aged 14+ with minimum prescribed educational/technical qualifications.",
    popularity: 58,
  },

  {
    slug: "pm-internship",
    name: "PM Internship Scheme",
    nameHindi: "पीएम इंटर्नशिप योजना",
    category: "employment",
    ministry: "Ministry of Corporate Affairs",
    shortDescription:
      "12-month internships in top 500 companies with Rs 5,000/month assistance and Rs 6,000 one-time grant.",
    description:
      "PM Internship Scheme offers youth 12-month internships in India's top 500 companies for real-world experience. Interns receive Rs 5,000 monthly (Rs 4,500 from Government + Rs 500 from company CSR) and a one-time grant of Rs 6,000. Includes accident insurance and PMJJBY/PMSBY cover.",
    benefits: [
      "Monthly assistance of Rs 5,000 for 12 months",
      "One-time grant of Rs 6,000 on joining",
      "12 months hands-on experience in top 500 companies",
      "Insurance cover during internship",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Educational qualification certificates",
      "Bank account details (Aadhaar-seeded)",
    ],
    applySteps: [
      "Register on pminternship.mca.gov.in",
      "Build profile and shortlist internships",
      "Apply to up to 5 opportunities",
      "Accept offer and complete onboarding",
    ],
    officialLink: "https://pminternship.mca.gov.in",
    applicableStates: [],
    tags: ["internship", "youth", "stipend", "company", "employment"],
    eligibilityRules: [
      { field: "age", operator: "gte", value: 21, label: "You are between 21 and 24 years old" },
      { field: "age", operator: "lte", value: 24, label: "You are not older than 24" },
      { field: "employmentStatus", operator: "in", value: ["unemployed", "student"], label: "You are not in full-time employment or full-time education" },
      { field: "annualIncome", operator: "lt", value: 800000, label: "Family annual income below Rs 8 lakh" },
    ],
    eligibilitySummary:
      "Indian citizens aged 21–24, not in full-time job or education, family income below Rs 8 lakh.",
    popularity: 78,
  },

  {
    slug: "maef-scholarship",
    name: "Maulana Azad National Fellowship for Minority Students",
    nameHindi: "मौलाना आजाद राष्ट्रीय फेलोशिप",
    category: "scholarship",
    ministry: "Ministry of Minority Affairs",
    shortDescription:
      "Five-year fellowship (JRF/SRF rates) for minority students pursuing M.Phil/PhD.",
    description:
      "MANF provides financial assistance to students from notified minority communities (Muslim, Christian, Sikh, Buddhist, Jain, Parsi) pursuing M.Phil and PhD in Indian universities. The fellowship follows UGC NET-JRF rates and includes contingency, HRA and escort/reader assistance for PwD scholars.",
    benefits: [
      "JRF/SRF fellowship rates (currently Rs 37,000/Rs 42,000 per month)",
      "Contingency grant of Rs 10,000–20,500/year",
      "HRA as per UGC norms",
      "Escort/Reader allowance for differently-abled scholars",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Caste / minority community certificate",
      "Income certificate (family income < Rs 6 lakh)",
      "Educational qualification certificates",
      "PhD/M.Phil registration proof",
    ],
    applySteps: [
      "Register on the National Scholarship Portal (NSP)",
      "Apply in the MANF section after qualifying NTA test",
      "Upload required documents and bank details",
      "Track status through NSP",
    ],
    officialLink: "https://scholarships.gov.in",
    applicableStates: [],
    tags: ["minority", "research", "phd", "scholarship", "fellowship"],
    eligibilityRules: [
      { field: "casteCategory", operator: "eq", value: "minority", label: "You belong to a notified minority community" },
      { field: "annualIncome", operator: "lt", value: 600000, label: "Family income below Rs 6 lakh per year" },
      { field: "educationLevel", operator: "in", value: ["postgraduate"], label: "You are pursuing M.Phil/PhD" },
    ],
    eligibilitySummary:
      "Minority community students (Muslim, Christian, Sikh, Buddhist, Jain, Parsi) pursuing M.Phil/PhD with family income below Rs 6 lakh.",
    popularity: 50,
  },

  // ============================================================
  // STATE FLAGSHIP SCHEMES
  // ============================================================
  {
    slug: "ap-ysr-cheyutha",
    name: "YSR Cheyutha",
    nameHindi: "वाईएसआर चेयुथा",
    category: "women",
    ministry: "Andhra Pradesh – Women, Children, Disabled & Senior Citizens Department",
    shortDescription:
      "Rs 75,000 over 4 years (Rs 18,750/year) to women aged 45–60 from SC/ST/BC/Minority communities.",
    description:
      "YSR Cheyutha provides financial assistance to women aged between 45 and 60 years from SC, ST, BC and Minority communities in Andhra Pradesh. The amount is meant to be used as seed capital for self-employment, in tie-up with banks and partner companies.",
    benefits: [
      "Rs 18,750 per year for 4 consecutive years (total Rs 75,000)",
      "Bank tie-ups for additional working capital loans",
      "Tie-ups with companies (Amul, Reliance, etc.) for marketing support",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Caste certificate (SC/ST/BC/Minority)",
      "Ration card",
      "Bank account details",
      "Residence proof of Andhra Pradesh",
    ],
    applySteps: [
      "Apply through your village/ward Volunteer or Grama/Ward Sachivalayam",
      "Verification by Welfare Assistant",
      "Approval and payment via DBT to bank account",
    ],
    officialLink: "https://gsws-nbm.ap.gov.in",
    applicableStates: ["Andhra Pradesh"],
    tags: ["women", "sc", "st", "obc", "minority", "self-employment"],
    eligibilityRules: [
      { field: "state", operator: "eq", value: "Andhra Pradesh", label: "You live in Andhra Pradesh" },
      { field: "gender", operator: "eq", value: "female", label: "You are a woman" },
      { field: "age", operator: "gte", value: 45, label: "You are between 45 and 60 years old" },
      { field: "age", operator: "lte", value: 60, label: "You are not older than 60" },
      { field: "casteCategory", operator: "in", value: ["sc", "st", "obc", "minority"], label: "You belong to SC/ST/BC/Minority community" },
    ],
    eligibilitySummary:
      "Women aged 45–60 from SC/ST/BC/Minority communities residing in Andhra Pradesh.",
    popularity: 70,
  },

  {
    slug: "assam-orunodoi",
    name: "Orunodoi 3.0",
    nameHindi: "अरुणोदय",
    category: "women",
    ministry: "Government of Assam – Finance Department",
    shortDescription:
      "Rs 1,250 monthly direct cash transfer to women heads of poor households in Assam.",
    description:
      "Orunodoi is Assam's flagship DBT scheme that gives Rs 1,250 every month to woman head of eligible economically weaker households. The aim is to enhance the financial independence of women and improve household nutrition, healthcare and education spending.",
    benefits: [
      "Rs 1,250 per month directly to woman's bank account",
      "Improved purchasing power for food, medicine and education",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Bank passbook (account in woman's name)",
      "Ration card",
      "Voter ID",
      "PAN card (if available)",
    ],
    applySteps: [
      "Application invited periodically by Finance Department, Government of Assam",
      "Submit form at Circle Office or via local representative",
      "Verification by district authorities",
      "Monthly DBT after approval",
    ],
    officialLink: "https://orunodoi.assam.gov.in",
    applicableStates: ["Assam"],
    tags: ["women", "cash-transfer", "household", "poverty"],
    eligibilityRules: [
      { field: "state", operator: "eq", value: "Assam", label: "You live in Assam" },
      { field: "gender", operator: "eq", value: "female", label: "You are the woman head of the household" },
      { field: "annualIncome", operator: "lt", value: 200000, label: "Family annual income below Rs 2 lakh" },
    ],
    eligibilitySummary:
      "Woman head of economically weaker households in Assam (income below Rs 2 lakh, no Government job).",
    popularity: 75,
  },

  {
    slug: "bihar-kanya-utthan",
    name: "Mukhyamantri Kanya Utthan Yojana",
    nameHindi: "मुख्यमंत्री कन्या उत्थान योजना",
    category: "women",
    ministry: "Government of Bihar – Social Welfare Department",
    shortDescription:
      "Up to Rs 54,100 from birth till graduation for every girl in Bihar.",
    description:
      "Mukhyamantri Kanya Utthan Yojana provides financial support to girls at every stage of life — at birth, on Aadhaar registration, at one and two years (immunisation), on uniforms and sanitary napkins through school years, on passing intermediate (Rs 25,000) and on completing graduation (Rs 50,000 — increased from Rs 25,000 in 2024).",
    benefits: [
      "Rs 2,000 at birth + Rs 1,000 on Aadhaar enrolment",
      "Rs 600–1,000 at age 1 and 2 (immunisation)",
      "Rs 600 per year for uniforms (classes 1–12)",
      "Rs 300 per year for sanitary napkins (classes 7–12)",
      "Rs 25,000 on passing intermediate (unmarried)",
      "Rs 50,000 on graduation (all girls)",
    ],
    requiredDocuments: [
      "Aadhaar card of girl and parents",
      "Birth certificate",
      "Educational mark sheets",
      "Bank account in girl's name",
      "Bihar residence proof",
    ],
    applySteps: [
      "Register on medhasoft.bih.nic.in for the relevant component",
      "Upload mark sheets and bank details",
      "Verification by school / college / ICDS",
      "DBT to girl's / parent's bank account",
    ],
    officialLink: "https://medhasoft.bih.nic.in",
    applicableStates: ["Bihar"],
    tags: ["girl-child", "education", "scholarship", "graduation"],
    eligibilityRules: [
      { field: "state", operator: "eq", value: "Bihar", label: "You live in Bihar" },
      { field: "gender", operator: "eq", value: "female", label: "You are a girl / woman" },
    ],
    eligibilitySummary:
      "Every girl child resident of Bihar from birth to graduation.",
    popularity: 80,
  },

  {
    slug: "cg-mahtari-vandan",
    name: "Mahtari Vandan Yojana",
    nameHindi: "महतारी वंदन योजना",
    category: "women",
    ministry: "Government of Chhattisgarh – Women & Child Development",
    shortDescription:
      "Rs 1,000 per month (Rs 12,000/year) to married women aged 21+ in Chhattisgarh.",
    description:
      "Mahtari Vandan Yojana gives Rs 1,000 every month directly to bank accounts of eligible married women in Chhattisgarh, to improve their financial independence and family welfare.",
    benefits: [
      "Rs 1,000 per month direct cash transfer (Rs 12,000 per year)",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Marriage certificate / proof of marriage",
      "Bank passbook (Aadhaar-linked)",
      "Domicile certificate of Chhattisgarh",
    ],
    applySteps: [
      "Apply online at mahtarivandan.cgstate.gov.in or at Anganwadi centre",
      "Submit Aadhaar, marriage proof and bank details",
      "Verification by ICDS officials",
      "Monthly DBT after approval",
    ],
    officialLink: "https://mahtarivandan.cgstate.gov.in",
    applicableStates: ["Chhattisgarh"],
    tags: ["women", "married", "cash-transfer"],
    eligibilityRules: [
      { field: "state", operator: "eq", value: "Chhattisgarh", label: "You live in Chhattisgarh" },
      { field: "gender", operator: "eq", value: "female", label: "You are a woman" },
      { field: "age", operator: "gte", value: 21, label: "You are 21 years or older" },
    ],
    eligibilitySummary:
      "Married, divorced, abandoned or widowed women aged 21+ residing in Chhattisgarh. Family must not pay income tax.",
    popularity: 78,
  },

  {
    slug: "delhi-pink-pass",
    name: "Pink Ticket – Free Bus Travel for Women in Delhi",
    nameHindi: "पिंक टिकट",
    category: "women",
    ministry: "Government of NCT of Delhi – Transport Department",
    shortDescription:
      "Free travel in DTC and cluster buses for all women in Delhi.",
    description:
      "Under the Pink Ticket initiative, every woman travelling in DTC and Cluster (Orange) buses in Delhi gets a free 'Pink Ticket' instead of paying fare. Aimed at safer mobility, more women in workforce and reduced cost burden.",
    benefits: [
      "Unlimited free travel in DTC and Cluster buses across Delhi",
      "Encourages safer mobility through marshals on buses",
    ],
    requiredDocuments: [
      "No documents needed at the time of travel — simply request a Pink Ticket from the conductor",
    ],
    applySteps: [
      "Board any DTC or Orange (cluster) bus",
      "Ask the conductor for a free Pink Ticket",
    ],
    officialLink: "https://transport.delhi.gov.in",
    applicableStates: ["Delhi"],
    tags: ["women", "transport", "free-travel", "delhi"],
    eligibilityRules: [
      { field: "state", operator: "eq", value: "Delhi", label: "You travel in Delhi" },
      { field: "gender", operator: "eq", value: "female", label: "You are a woman" },
    ],
    eligibilitySummary:
      "All women travelling in DTC and cluster buses in Delhi (residents and non-residents).",
    popularity: 75,
  },

  {
    slug: "goa-griha-aadhar",
    name: "Griha Aadhar Scheme",
    nameHindi: "गृह आधार योजना",
    category: "women",
    ministry: "Government of Goa – Directorate of Women & Child Development",
    shortDescription:
      "Up to Rs 1,500 per month to housewives in Goa to support household needs.",
    description:
      "Griha Aadhar provides monthly cash assistance to housewives in Goa to mitigate the impact of price rise on essential commodities. The amount has been progressively increased and is currently Rs 1,500 per month for eligible women.",
    benefits: [
      "Rs 1,500 per month direct credit to bank account",
      "Helps offset inflation in essential household items",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Marriage certificate",
      "Goa residence proof (15 years)",
      "Income certificate (annual income < Rs 3 lakh)",
      "Bank account details",
    ],
    applySteps: [
      "Apply at Directorate of Women & Child Development office or through Goa Online portal",
      "Submit residence and income proof",
      "Verification by Department",
      "Monthly DBT after approval",
    ],
    officialLink: "https://www.wcd.goa.gov.in",
    applicableStates: ["Goa"],
    tags: ["women", "housewife", "goa", "cash-transfer"],
    eligibilityRules: [
      { field: "state", operator: "eq", value: "Goa", label: "You live in Goa" },
      { field: "gender", operator: "eq", value: "female", label: "You are a married woman / housewife" },
      { field: "annualIncome", operator: "lt", value: 300000, label: "Family income below Rs 3 lakh" },
    ],
    eligibilitySummary:
      "Married women housewives residing in Goa for 15+ years, with annual family income below Rs 3 lakh.",
    popularity: 60,
  },

  {
    slug: "gujarat-vahli-dikri",
    name: "Vahli Dikri Yojana",
    nameHindi: "वहाली दीकरी योजना",
    category: "women",
    ministry: "Government of Gujarat – Women & Child Development",
    shortDescription:
      "Up to Rs 1,10,000 in three instalments for the first two daughters of a family.",
    description:
      "Vahli Dikri Yojana supports the first two daughters of eligible families with Rs 4,000 in class 1, Rs 6,000 in class 9, and Rs 1,00,000 on attaining 18 years of age (for higher education or marriage). Aims to encourage girl child birth and education in Gujarat.",
    benefits: [
      "Rs 4,000 in class 1",
      "Rs 6,000 in class 9",
      "Rs 1,00,000 on completing 18 years",
    ],
    requiredDocuments: [
      "Birth certificate of girl child",
      "Aadhaar of parents and child",
      "Bank passbook of the girl",
      "Income certificate (family income ≤ Rs 2 lakh)",
      "Gujarat residence proof",
    ],
    applySteps: [
      "Apply at Anganwadi or Mamlatdar's office",
      "Submit birth certificate and income proof",
      "Verification by ICDS",
      "DBT instalments at the prescribed milestones",
    ],
    officialLink: "https://wcd.gujarat.gov.in",
    applicableStates: ["Gujarat"],
    tags: ["girl-child", "education", "marriage", "gujarat"],
    eligibilityRules: [
      { field: "state", operator: "eq", value: "Gujarat", label: "You live in Gujarat" },
      { field: "gender", operator: "eq", value: "female", label: "You are a girl / her parent applying" },
      { field: "annualIncome", operator: "lte", value: 200000, label: "Family annual income up to Rs 2 lakh" },
    ],
    eligibilitySummary:
      "First two daughters of families in Gujarat with annual income up to Rs 2 lakh, born on or after 02-Aug-2019.",
    popularity: 65,
  },

  {
    slug: "haryana-lado-lakshmi",
    name: "Lado Lakshmi Yojana",
    nameHindi: "लाडो लक्ष्मी योजना",
    category: "women",
    ministry: "Government of Haryana – Women & Child Development",
    shortDescription:
      "Rs 2,100 per month direct cash assistance to women in Haryana.",
    description:
      "Lado Lakshmi Yojana, announced by the Government of Haryana, provides Rs 2,100 every month to eligible adult women residents of Haryana to enhance their financial independence and decision-making power within the household.",
    benefits: [
      "Rs 2,100 per month direct credit to bank account",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Haryana Parivar Pehchan Patra (Family ID)",
      "Bank passbook (Aadhaar-seeded)",
      "Income proof",
    ],
    applySteps: [
      "Register through Parivar Pehchan Patra portal",
      "Submit Family ID, Aadhaar and bank details",
      "Verification by Department",
      "Monthly DBT after approval",
    ],
    officialLink: "https://wcdhry.gov.in",
    applicableStates: ["Haryana"],
    tags: ["women", "haryana", "cash-transfer"],
    eligibilityRules: [
      { field: "state", operator: "eq", value: "Haryana", label: "You live in Haryana" },
      { field: "gender", operator: "eq", value: "female", label: "You are a woman" },
      { field: "age", operator: "gte", value: 18, label: "You are 18 years or older" },
    ],
    eligibilitySummary:
      "Adult women residents of Haryana with Parivar Pehchan Patra. Family income criteria as notified.",
    popularity: 70,
  },

  {
    slug: "hp-himcare",
    name: "HIMCARE – Himachal Pradesh Universal Health Protection Scheme",
    nameHindi: "हिमकेयर",
    category: "healthcare",
    ministry: "Government of Himachal Pradesh – Health & Family Welfare",
    shortDescription:
      "Cashless health insurance up to Rs 5 lakh per family per year for HP residents not covered by AB-PMJAY.",
    description:
      "HIMCARE provides cashless secondary and tertiary care up to Rs 5 lakh per family per year on a floater basis at empanelled hospitals. It covers HP residents who are not entitled to AB-PMJAY, with subsidised premiums (Rs 0–1,000 per year based on category).",
    benefits: [
      "Cashless treatment up to Rs 5 lakh per family per year",
      "Coverage at empanelled public and private hospitals",
      "Pre-existing diseases covered",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Himachali Bonafide certificate / domicile",
      "Ration card",
      "Income / category certificate",
    ],
    applySteps: [
      "Apply via Lok Mitra Kendra or hpsbys.in portal",
      "Pay applicable premium",
      "Receive HIMCARE e-card",
      "Avail cashless treatment at empanelled hospital",
    ],
    officialLink: "https://hpsbys.in",
    applicableStates: ["Himachal Pradesh"],
    tags: ["healthcare", "insurance", "hp", "cashless"],
    eligibilityRules: [
      { field: "state", operator: "eq", value: "Himachal Pradesh", label: "You are an HP resident" },
    ],
    eligibilitySummary:
      "Bonafide Himachali residents not eligible for AB-PMJAY. Premium varies from nil (BPL/SC/ST/disabled/widows) to Rs 1,000 (general).",
    popularity: 65,
  },

  {
    slug: "jharkhand-maiya-samman",
    name: "Mukhyamantri Maiya Samman Yojana",
    nameHindi: "मुख्यमंत्री मैया सम्मान योजना",
    category: "women",
    ministry: "Government of Jharkhand – Women, Child Development & Social Security",
    shortDescription:
      "Rs 2,500 per month to women aged 18–50 in Jharkhand.",
    description:
      "Mukhyamantri Maiya Samman Yojana provides monthly financial assistance to eligible women aged 18 to 50 years in Jharkhand. Originally launched at Rs 1,000/month, the amount has been revised upwards to Rs 2,500/month.",
    benefits: [
      "Rs 2,500 per month direct cash transfer",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Bank passbook (Aadhaar-linked)",
      "Ration card",
      "Jharkhand residence proof",
    ],
    applySteps: [
      "Apply at Anganwadi centre or block office camps",
      "Submit Aadhaar, ration card, bank details",
      "Verification and monthly DBT after approval",
    ],
    officialLink: "https://mmmsy.jharkhand.gov.in",
    applicableStates: ["Jharkhand"],
    tags: ["women", "jharkhand", "cash-transfer"],
    eligibilityRules: [
      { field: "state", operator: "eq", value: "Jharkhand", label: "You live in Jharkhand" },
      { field: "gender", operator: "eq", value: "female", label: "You are a woman" },
      { field: "age", operator: "gte", value: 18, label: "You are between 18 and 50 years old" },
      { field: "age", operator: "lte", value: 50, label: "You are not older than 50" },
    ],
    eligibilitySummary:
      "Women aged 18–50 residing in Jharkhand, family not paying income tax and not in Government job.",
    popularity: 78,
  },

  {
    slug: "karnataka-gruha-lakshmi",
    name: "Gruha Lakshmi Scheme",
    nameHindi: "गृह लक्ष्मी योजना",
    category: "women",
    ministry: "Government of Karnataka – Women & Child Development",
    shortDescription:
      "Rs 2,000 per month to woman head of every eligible family in Karnataka.",
    description:
      "Gruha Lakshmi is a guarantee scheme that gives Rs 2,000 per month to the woman head of every eligible household in Karnataka — those holding Antyodaya, BPL or APL ration cards (excluding GST-registered/income-tax-paying families).",
    benefits: [
      "Rs 2,000 per month directly to woman's bank account",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Ration card (Antyodaya / BPL / APL)",
      "Bank passbook (Aadhaar-linked)",
    ],
    applySteps: [
      "Apply through Seva Sindhu portal or at Bapuji / Karnataka One / Grama One centres",
      "Provide Aadhaar and ration card details",
      "Verification and monthly DBT",
    ],
    officialLink: "https://sevasindhuservices.karnataka.gov.in",
    applicableStates: ["Karnataka"],
    tags: ["women", "karnataka", "cash-transfer", "household"],
    eligibilityRules: [
      { field: "state", operator: "eq", value: "Karnataka", label: "You live in Karnataka" },
      { field: "gender", operator: "eq", value: "female", label: "You are the woman head of the family on the ration card" },
    ],
    eligibilitySummary:
      "Woman head of family on Antyodaya/BPL/APL ration cards in Karnataka. Family not GST-registered or paying income tax.",
    popularity: 80,
  },

  {
    slug: "kerala-kasp",
    name: "Karunya Arogya Suraksha Padhathi (KASP)",
    nameHindi: "करुण्य आरोग्य सुरक्षा पद्धति",
    category: "healthcare",
    ministry: "Government of Kerala – State Health Agency",
    shortDescription:
      "Cashless secondary and tertiary care up to Rs 5 lakh per family per year for eligible Kerala residents.",
    description:
      "KASP is Kerala's converged health protection scheme that integrates Ayushman Bharat-PMJAY with state Karunya benefits. It provides cashless care up to Rs 5 lakh per family per year at empanelled hospitals, covering over 1,900 procedures.",
    benefits: [
      "Cashless cover up to Rs 5 lakh per family per year",
      "Coverage at over 600 empanelled hospitals",
      "Pre-existing illnesses covered from day 1",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Ration card",
      "KASP / PMJAY beneficiary identification",
    ],
    applySteps: [
      "Check eligibility on sha.kerala.gov.in",
      "Get e-card generated at empanelled hospital or CSC",
      "Avail cashless treatment at empanelled hospital",
    ],
    officialLink: "https://sha.kerala.gov.in",
    applicableStates: ["Kerala"],
    tags: ["healthcare", "insurance", "kerala", "cashless"],
    eligibilityRules: [
      { field: "state", operator: "eq", value: "Kerala", label: "You are a Kerala resident" },
    ],
    eligibilitySummary:
      "Kerala residents identified as PMJAY beneficiaries plus additional KASP-eligible categories notified by State Health Agency.",
    popularity: 65,
  },

  {
    slug: "mp-ladli-behna",
    name: "Mukhyamantri Ladli Behna Yojana",
    nameHindi: "मुख्यमंत्री लाडली बहना योजना",
    category: "women",
    ministry: "Government of Madhya Pradesh – Women & Child Development",
    shortDescription:
      "Rs 1,250 per month to women aged 21–60 in Madhya Pradesh.",
    description:
      "Mukhyamantri Ladli Behna Yojana provides monthly financial assistance directly to bank accounts of eligible women in Madhya Pradesh, to make them economically self-reliant and improve their role in family decision-making.",
    benefits: [
      "Rs 1,250 per month (Rs 15,000 per year) DBT",
    ],
    requiredDocuments: [
      "Samagra ID",
      "Aadhaar card",
      "Bank passbook (Aadhaar-linked, DBT-enabled)",
      "Madhya Pradesh residence proof",
    ],
    applySteps: [
      "Apply at Gram Panchayat / Ward Office camps",
      "e-KYC and submission of Samagra ID, Aadhaar",
      "Verification by camp officials",
      "Monthly DBT after approval",
    ],
    officialLink: "https://cmladlibahna.mp.gov.in",
    applicableStates: ["Madhya Pradesh"],
    tags: ["women", "mp", "cash-transfer"],
    eligibilityRules: [
      { field: "state", operator: "eq", value: "Madhya Pradesh", label: "You live in Madhya Pradesh" },
      { field: "gender", operator: "eq", value: "female", label: "You are a woman" },
      { field: "age", operator: "gte", value: 21, label: "You are between 21 and 60 years old" },
      { field: "age", operator: "lte", value: 60, label: "You are not older than 60" },
      { field: "annualIncome", operator: "lt", value: 250000, label: "Family annual income below Rs 2.5 lakh" },
    ],
    eligibilitySummary:
      "Married, divorced, abandoned or widowed women aged 21–60 residing in MP. Family income below Rs 2.5 lakh and not income-tax payer.",
    popularity: 88,
  },

  {
    slug: "maha-ladki-bahin",
    name: "Mukhyamantri Majhi Ladki Bahin Yojana",
    nameHindi: "मुख्यमंत्री माझी लाडकी बहीण योजना",
    category: "women",
    ministry: "Government of Maharashtra – Women & Child Development",
    shortDescription:
      "Rs 1,500 per month to eligible women aged 21–65 in Maharashtra.",
    description:
      "Mukhyamantri Majhi Ladki Bahin Yojana supports women in Maharashtra with a direct monthly transfer of Rs 1,500 to their bank accounts to enable economic self-reliance and family welfare.",
    benefits: [
      "Rs 1,500 per month direct credit to bank account (Rs 18,000/year)",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Bank passbook (Aadhaar-linked)",
      "Ration card",
      "Maharashtra domicile certificate",
    ],
    applySteps: [
      "Apply on Nari Shakti Doot mobile app or at Anganwadi/Setu Suvidha Kendra",
      "Submit Aadhaar, bank and domicile proof",
      "Verification by district authorities",
      "Monthly DBT after approval",
    ],
    officialLink: "https://ladakibahin.maharashtra.gov.in",
    applicableStates: ["Maharashtra"],
    tags: ["women", "maharashtra", "cash-transfer"],
    eligibilityRules: [
      { field: "state", operator: "eq", value: "Maharashtra", label: "You live in Maharashtra" },
      { field: "gender", operator: "eq", value: "female", label: "You are a woman" },
      { field: "age", operator: "gte", value: 21, label: "You are between 21 and 65 years old" },
      { field: "age", operator: "lte", value: 65, label: "You are not older than 65" },
      { field: "annualIncome", operator: "lt", value: 250000, label: "Family annual income below Rs 2.5 lakh" },
    ],
    eligibilitySummary:
      "Married, widowed, divorced, abandoned or single women aged 21–65 residing in Maharashtra, family income below Rs 2.5 lakh.",
    popularity: 90,
  },

  {
    slug: "odisha-subhadra",
    name: "Subhadra Yojana",
    nameHindi: "सुभद्रा योजना",
    category: "women",
    ministry: "Government of Odisha – Women & Child Development",
    shortDescription:
      "Rs 50,000 over 5 years (Rs 10,000/year in two instalments) to women aged 21–60 in Odisha.",
    description:
      "Subhadra Yojana credits Rs 5,000 each on Rakhi Purnima and International Women's Day (total Rs 10,000 per year) to eligible women aged 21–60 in Odisha for five years (total Rs 50,000). Top performing 100 women in each Gram Panchayat / Urban Local Body for digital transactions get an additional Rs 500.",
    benefits: [
      "Rs 10,000 per year (in two equal instalments) for 5 years",
      "Additional Rs 500 incentive for top digital transaction performers",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Odisha residence proof",
      "Bank passbook (Aadhaar-linked, DBT-enabled)",
      "Ration card",
    ],
    applySteps: [
      "Apply on subhadra.odisha.gov.in or at Mo Seva Kendra",
      "Submit Aadhaar and bank details",
      "Verification by district authorities",
      "Receive Subhadra Card and benefits via DBT",
    ],
    officialLink: "https://subhadra.odisha.gov.in",
    applicableStates: ["Odisha"],
    tags: ["women", "odisha", "cash-transfer", "digital"],
    eligibilityRules: [
      { field: "state", operator: "eq", value: "Odisha", label: "You live in Odisha" },
      { field: "gender", operator: "eq", value: "female", label: "You are a woman" },
      { field: "age", operator: "gte", value: 21, label: "You are between 21 and 60 years old" },
      { field: "age", operator: "lte", value: 60, label: "You are not older than 60" },
      { field: "annualIncome", operator: "lt", value: 250000, label: "Family annual income below Rs 2.5 lakh" },
    ],
    eligibilitySummary:
      "Women aged 21–60 residing in Odisha, family income below Rs 2.5 lakh, not income-tax payer or government employee.",
    popularity: 82,
  },

  {
    slug: "rj-chiranjeevi",
    name: "Mukhyamantri Ayushman Arogya Yojana (formerly Chiranjeevi)",
    nameHindi: "मुख्यमंत्री आयुष्मान आरोग्य योजना",
    category: "healthcare",
    ministry: "Government of Rajasthan – Medical, Health & Family Welfare",
    shortDescription:
      "Cashless health insurance up to Rs 25 lakh per family per year for Rajasthan residents.",
    description:
      "Rajasthan's flagship health protection scheme provides cashless treatment up to Rs 25 lakh per family per year (including organ transplant cover) at over 1,750 empanelled public and private hospitals, integrating with AB-PMJAY for eligible families.",
    benefits: [
      "Cashless cover up to Rs 25 lakh per family per year",
      "Includes Rs 10 lakh general + Rs 15 lakh critical illness cover",
      "Pre-existing diseases covered from day 1",
      "Free coverage for SECC, NFSA, small farmers, contractual workers",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Jan Aadhaar card",
      "Bank passbook",
    ],
    applySteps: [
      "Register on chiranjeevi.rajasthan.gov.in via Jan Aadhaar",
      "Pay premium (Rs 850/year for general; free for eligible categories)",
      "Receive policy and avail cashless treatment at empanelled hospital",
    ],
    officialLink: "https://chiranjeevi.rajasthan.gov.in",
    applicableStates: ["Rajasthan"],
    tags: ["healthcare", "insurance", "rajasthan", "cashless"],
    eligibilityRules: [
      { field: "state", operator: "eq", value: "Rajasthan", label: "You are a Rajasthan resident with Jan Aadhaar" },
    ],
    eligibilitySummary:
      "All Rajasthan residents with Jan Aadhaar. Free for SECC/NFSA/small farmers/contractual workers; Rs 850/year for others.",
    popularity: 70,
  },

  {
    slug: "tn-magalir-urimai",
    name: "Kalaignar Magalir Urimai Thittam",
    nameHindi: "कलैन्यर मगलिर उरिमई थिट्टम",
    category: "women",
    ministry: "Government of Tamil Nadu – Social Welfare & Women Empowerment",
    shortDescription:
      "Rs 1,000 per month basic income to woman head of every eligible household in Tamil Nadu.",
    description:
      "Kalaignar Magalir Urimai Thittam provides Rs 1,000 every month directly to the bank account of woman head of eligible households in Tamil Nadu, recognising the unpaid economic contribution of women.",
    benefits: [
      "Rs 1,000 per month basic income transfer",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Family card (ration card)",
      "Bank passbook (Aadhaar-linked)",
    ],
    applySteps: [
      "Apply at the camp organised by Tamil Nadu Government",
      "Submit family card and Aadhaar",
      "Verification and approval",
      "Monthly DBT to bank account",
    ],
    officialLink: "https://kmut.tn.gov.in",
    applicableStates: ["Tamil Nadu"],
    tags: ["women", "tamil-nadu", "cash-transfer", "basic-income"],
    eligibilityRules: [
      { field: "state", operator: "eq", value: "Tamil Nadu", label: "You live in Tamil Nadu" },
      { field: "gender", operator: "eq", value: "female", label: "You are the woman head of the family card" },
      { field: "age", operator: "gte", value: 21, label: "You are 21 years or older" },
    ],
    eligibilitySummary:
      "Woman head of family on Tamil Nadu ration cards, aged 21+, with annual family income below specified limits and not income-tax payer.",
    popularity: 85,
  },

  {
    slug: "telangana-rythu-bandhu",
    name: "Rythu Bandhu Scheme",
    nameHindi: "रायतु बंधु",
    category: "agriculture",
    ministry: "Government of Telangana – Agriculture Department",
    shortDescription:
      "Rs 5,000 per acre per season (Rs 10,000/acre/year) investment support to farmers in Telangana.",
    description:
      "Rythu Bandhu, the Farmers' Investment Support Scheme, gives Rs 5,000 per acre per season directly to land-owning farmers in Telangana, before each Kharif and Rabi crop. The aim is to relieve farmers from debt burden for crop investment.",
    benefits: [
      "Rs 5,000 per acre per season (Rs 10,000/acre/year)",
      "Direct credit to bank account before each crop season",
      "No upper land ceiling currently applied",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Pattadar passbook / Land record",
      "Bank passbook (Aadhaar-linked)",
    ],
    applySteps: [
      "Get land records updated through Mee Seva / Tahsildar",
      "Pattadar passbook is the basis of payment — no separate application",
      "Receive cheque distribution at village or DBT to bank",
    ],
    officialLink: "https://rythubandhu.telangana.gov.in",
    applicableStates: ["Telangana"],
    tags: ["farmer", "telangana", "investment-support", "agriculture"],
    eligibilityRules: [
      { field: "state", operator: "eq", value: "Telangana", label: "You live in Telangana" },
      { field: "isFarmer", operator: "true", label: "You own agricultural land in Telangana" },
    ],
    eligibilitySummary:
      "Land-owning farmers in Telangana with valid pattadar passbook.",
    popularity: 80,
  },

  {
    slug: "up-kanya-sumangala",
    name: "Mukhyamantri Kanya Sumangala Yojana",
    nameHindi: "मुख्यमंत्री कन्या सुमंगला योजना",
    category: "women",
    ministry: "Government of Uttar Pradesh – Women Welfare Department",
    shortDescription:
      "Up to Rs 25,000 in six instalments for the girl child from birth till graduation.",
    description:
      "Mukhyamantri Kanya Sumangala Yojana supports the girl child of UP families with annual income up to Rs 3 lakh in six instalments — at birth (Rs 5,000), one-year immunisation (Rs 2,000), class 1 admission (Rs 3,000), class 6 (Rs 3,000), class 9 (Rs 5,000) and on graduation/diploma admission (Rs 7,000). Total benefit Rs 25,000 (revised from Rs 15,000).",
    benefits: [
      "Rs 5,000 at birth + Rs 2,000 on one-year immunisation",
      "Rs 3,000 each at class 1 and class 6 admission",
      "Rs 5,000 at class 9 admission",
      "Rs 7,000 at graduation / 2-year diploma admission",
    ],
    requiredDocuments: [
      "Aadhaar of girl and parents",
      "Birth certificate",
      "Bank passbook of mother / guardian",
      "Income certificate (annual income ≤ Rs 3 lakh)",
      "UP residence proof",
    ],
    applySteps: [
      "Register on mksy.up.gov.in",
      "Submit applicable documents at each milestone",
      "Verification by Block / District officials",
      "DBT to bank account at each instalment",
    ],
    officialLink: "https://mksy.up.gov.in",
    applicableStates: ["Uttar Pradesh"],
    tags: ["girl-child", "education", "scholarship", "up"],
    eligibilityRules: [
      { field: "state", operator: "eq", value: "Uttar Pradesh", label: "You live in Uttar Pradesh" },
      { field: "gender", operator: "eq", value: "female", label: "Beneficiary is a girl" },
      { field: "annualIncome", operator: "lte", value: 300000, label: "Family annual income up to Rs 3 lakh" },
    ],
    eligibilitySummary:
      "Up to two girl children per family in UP with family income up to Rs 3 lakh.",
    popularity: 78,
  },

  {
    slug: "wb-lakshmir-bhandar",
    name: "Lakshmir Bhandar",
    nameHindi: "लक्ष्मीर भंडार",
    category: "women",
    ministry: "Government of West Bengal – Women & Child Development",
    shortDescription:
      "Rs 1,000 per month (Rs 1,200 for SC/ST) to women aged 25–60 in West Bengal.",
    description:
      "Lakshmir Bhandar provides monthly basic income of Rs 1,000 to general category women and Rs 1,200 to SC/ST women aged 25–60 years in West Bengal, transferred directly to their bank accounts.",
    benefits: [
      "Rs 1,000/month for general category women",
      "Rs 1,200/month for SC/ST women",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Bank passbook (single account in woman's name)",
      "Swasthya Sathi card",
      "Caste certificate (for SC/ST)",
    ],
    applySteps: [
      "Apply at Duare Sarkar camp or Block / Municipality office",
      "Submit Aadhaar, Swasthya Sathi and bank details",
      "Verification by district authorities",
      "Monthly DBT after approval",
    ],
    officialLink: "https://socialsecurity.wb.gov.in",
    applicableStates: ["West Bengal"],
    tags: ["women", "west-bengal", "cash-transfer"],
    eligibilityRules: [
      { field: "state", operator: "eq", value: "West Bengal", label: "You live in West Bengal" },
      { field: "gender", operator: "eq", value: "female", label: "You are a woman" },
      { field: "age", operator: "gte", value: 25, label: "You are between 25 and 60 years old" },
      { field: "age", operator: "lte", value: 60, label: "You are not older than 60" },
    ],
    eligibilitySummary:
      "Women aged 25–60 residing in West Bengal with Swasthya Sathi card. Higher amount for SC/ST.",
    popularity: 88,
  },

  {
    slug: "wb-kanyashree",
    name: "Kanyashree Prakalpa",
    nameHindi: "कन्याश्री प्रकल्प",
    category: "scholarship",
    ministry: "Government of West Bengal – Women & Child Development",
    shortDescription:
      "Annual scholarship + one-time Rs 25,000 grant to encourage girls' education and delay marriage.",
    description:
      "Kanyashree Prakalpa is a UN award-winning scheme for girls aged 13–18 (annual scholarship K1) and a one-time grant of Rs 25,000 (K2) on turning 18 if still unmarried and continuing education. There is also K3 — assistance for postgraduate students in selected subjects.",
    benefits: [
      "K1 — Rs 1,000 annual scholarship for girls aged 13–18 in classes 8–12",
      "K2 — One-time Rs 25,000 on turning 18 if unmarried and in education",
      "K3 — Monthly stipend for PG students in selected subjects",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Bank passbook (single account in girl's name)",
      "School / college certificate of enrolment",
      "Unmarried declaration",
    ],
    applySteps: [
      "Apply through school / college using Kanyashree forms K1 and K2",
      "School/college forwards to district office",
      "Verification and DBT to girl's bank account",
    ],
    officialLink: "https://wbkanyashree.gov.in",
    applicableStates: ["West Bengal"],
    tags: ["girl-child", "scholarship", "west-bengal", "education"],
    eligibilityRules: [
      { field: "state", operator: "eq", value: "West Bengal", label: "You live in West Bengal" },
      { field: "gender", operator: "eq", value: "female", label: "You are an unmarried girl" },
      { field: "age", operator: "gte", value: 13, label: "You are 13 years or older" },
      { field: "annualIncome", operator: "lte", value: 120000, label: "Family income up to Rs 1.2 lakh per year (K1)" },
      { field: "isStudent", operator: "true", label: "You are a student" },
    ],
    eligibilitySummary:
      "Unmarried girls aged 13–18 (K1) or turning 18 still studying (K2), residing in West Bengal.",
    popularity: 80,
  },

  {
    slug: "jk-pmsss",
    name: "PM Special Scholarship Scheme for J&K and Ladakh",
    nameHindi: "पीएम विशेष छात्रवृत्ति योजना",
    category: "scholarship",
    ministry: "AICTE – Ministry of Education",
    shortDescription:
      "Up to Rs 1.25 lakh per year for J&K/Ladakh students pursuing higher education outside the UT.",
    description:
      "PMSSS provides scholarships to students from J&K and Ladakh to pursue General, Engineering and Medical degree courses outside their home UT. It covers tuition fee (up to Rs 1.25 lakh / Rs 3 lakh / Rs 6 lakh per annum based on course type) plus academic and maintenance allowance of Rs 1 lakh per annum.",
    benefits: [
      "Tuition fee — up to Rs 1.25 lakh (general) / Rs 3 lakh (professional) / Rs 6 lakh (medical) per year",
      "Maintenance and academic allowance of Rs 1 lakh per year",
      "Admission in 250+ AICTE-approved institutions across India",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "J&K / Ladakh domicile certificate",
      "Class 12 mark sheet",
      "Income certificate (family income ≤ Rs 8 lakh)",
      "Bank passbook",
    ],
    applySteps: [
      "Register on aicte-pmsss.in within prescribed dates",
      "Fill course preferences and upload documents",
      "Counselling and seat allotment",
      "Receive scholarship in bank account each semester",
    ],
    officialLink: "https://www.aicte-pmsss.in",
    applicableStates: ["Jammu and Kashmir", "Ladakh"],
    tags: ["scholarship", "jk", "ladakh", "higher-education"],
    eligibilityRules: [
      { field: "state", operator: "in", value: ["Jammu and Kashmir", "Ladakh"], label: "You are a J&K / Ladakh domicile" },
      { field: "annualIncome", operator: "lte", value: 800000, label: "Family income up to Rs 8 lakh per year" },
      { field: "isStudent", operator: "true", label: "You are a student in higher education" },
    ],
    eligibilitySummary:
      "J&K and Ladakh domicile students who passed Class 12 with family income ≤ Rs 8 lakh, pursuing UG outside the UT.",
    popularity: 60,
  },

  {
    slug: "punjab-aam-aadmi-clinics",
    name: "Aam Aadmi Clinics – Punjab",
    nameHindi: "आम आदमी क्लीनिक",
    category: "healthcare",
    ministry: "Government of Punjab – Health & Family Welfare",
    shortDescription:
      "Free OPD consultation, 80+ medicines and 38 lab tests at neighbourhood clinics across Punjab.",
    description:
      "Aam Aadmi Clinics provide free primary healthcare — OPD consultation, 80+ essential medicines and 38 diagnostic tests — to all residents of Punjab in their neighbourhood. Clinics operate in both urban and rural areas.",
    benefits: [
      "Free OPD consultation",
      "Free 80+ essential medicines",
      "Free 38 routine diagnostic tests",
    ],
    requiredDocuments: [
      "Any photo ID (no specific document mandatory)",
    ],
    applySteps: [
      "Visit nearest Aam Aadmi Clinic",
      "Register at the front desk",
      "Get consultation, medicines and lab tests free of cost",
    ],
    officialLink: "https://pbhealth.gov.in",
    applicableStates: ["Punjab"],
    tags: ["healthcare", "punjab", "opd", "free-medicines"],
    eligibilityRules: [
      { field: "state", operator: "eq", value: "Punjab", label: "You live in Punjab" },
    ],
    eligibilitySummary:
      "Any resident of Punjab — urban or rural — can walk in.",
    popularity: 65,
  },

  {
    slug: "uk-vatsalya",
    name: "Mukhyamantri Vatsalya Yojana",
    nameHindi: "मुख्यमंत्री वात्सल्य योजना",
    category: "other",
    ministry: "Government of Uttarakhand – Women Empowerment & Child Development",
    shortDescription:
      "Rs 3,000 monthly pension and free education up to graduation to children orphaned by COVID/other calamities.",
    description:
      "Mukhyamantri Vatsalya Yojana provides monthly assistance of Rs 3,000 till age 21 plus free education till graduation, free ration and reservation in government jobs to children of Uttarakhand who lost both parents (or sole earning parent) due to COVID-19 or other reasons.",
    benefits: [
      "Rs 3,000 per month till the child turns 21",
      "Free education up to graduation",
      "Free ration",
      "5% horizontal reservation in government jobs",
    ],
    requiredDocuments: [
      "Aadhaar card of child and guardian",
      "Death certificate of parent(s)",
      "Uttarakhand domicile certificate",
      "Bank account details of child / guardian",
    ],
    applySteps: [
      "Apply at District Probation Officer's office",
      "Submit death certificates and domicile",
      "Verification and approval by District Magistrate",
      "Monthly DBT and education benefits activated",
    ],
    officialLink: "https://wecd.uk.gov.in",
    applicableStates: ["Uttarakhand"],
    tags: ["orphan", "child", "uttarakhand", "education"],
    eligibilityRules: [
      { field: "state", operator: "eq", value: "Uttarakhand", label: "Child resides in Uttarakhand" },
      { field: "age", operator: "lte", value: 21, label: "Child is up to 21 years old" },
    ],
    eligibilitySummary:
      "Children of Uttarakhand who have lost both parents or sole earning parent due to COVID-19 or other reasons.",
    popularity: 55,
  },

  {
    slug: "sikkim-aama-sahayata",
    name: "Aama Sahayata Yojana",
    nameHindi: "आमा सहायता योजना",
    category: "women",
    ministry: "Government of Sikkim – Women & Child Welfare",
    shortDescription:
      "Rs 20,000 per year to non-working housewives in Sikkim.",
    description:
      "Aama Sahayata Yojana provides Rs 20,000 every year to non-working mothers of Sikkim to recognise their domestic contribution and reduce out-of-pocket expenditure on household needs.",
    benefits: [
      "Rs 20,000 per year credited to bank account",
    ],
    requiredDocuments: [
      "Aadhaar card",
      "Sikkim Subject Certificate / COI",
      "Marriage certificate",
      "Bank passbook",
    ],
    applySteps: [
      "Apply at Block Administrative Centre or DDA office",
      "Submit COI/SSC, marriage and bank details",
      "Verification and approval",
      "Annual credit in bank account",
    ],
    officialLink: "https://sikkim.gov.in",
    applicableStates: ["Sikkim"],
    tags: ["women", "sikkim", "housewife", "annual-grant"],
    eligibilityRules: [
      { field: "state", operator: "eq", value: "Sikkim", label: "You are a Sikkim resident with COI/SSC" },
      { field: "gender", operator: "eq", value: "female", label: "You are a married woman / housewife" },
      { field: "employmentStatus", operator: "in", value: ["unemployed", "self_employed"], label: "You are not in regular employment" },
    ],
    eligibilitySummary:
      "Married, non-working mothers in Sikkim holding valid COI or Sikkim Subject Certificate.",
    popularity: 50,
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
      isCentralScheme: s.applicableStates.length === 0 ? 1 : 0,
      lastUpdated: s.lastUpdated ?? DEFAULT_LAST_UPDATED,
      applicationStartDate:
        s.applicationStartDate !== undefined
          ? s.applicationStartDate
          : (APPLICATION_WINDOWS[s.slug]?.start ?? null),
      applicationEndDate:
        s.applicationEndDate !== undefined
          ? s.applicationEndDate
          : (APPLICATION_WINDOWS[s.slug]?.end ?? null),
    });
  }
  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
