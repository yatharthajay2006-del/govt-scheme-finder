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
