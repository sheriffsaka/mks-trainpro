export const MOCK_CATEGORIES = [
  { id: '1', name: 'SAP Training', slug: 'sap-training', icon: '💻' },
  { id: '2', name: 'Software Testing', slug: 'software-testing', icon: '🧪' },
];

export const MOCK_COURSES = [
  {
    id: 'c1',
    category_id: '1',
    title: 'SAP Beginner Course',
    slug: 'sap-beginner',
    description: 'Master the fundamentals of SAP ERP and start your journey as an SAP professional.',
    overview: 'This course provides a comprehensive introduction to SAP ERP. You will learn about the core modules, navigation, and basic business processes within the SAP environment.',
    learning_outcomes: [
      'Understand SAP ERP architecture',
      'Navigate the SAP GUI effectively',
      'Perform basic transactions in Finance and Logistics',
      'Understand master data concepts'
    ],
    who_it_is_for: [
      'Graduates looking for IT careers',
      'Business professionals transitioning to SAP',
      'IT Support staff',
      'Beginners with no prior SAP experience'
    ],
    duration: '4 Weeks',
    format: 'Online / Live Sessions',
    certification_details: 'MKS SAP Fundamentals Certificate',
    price_standard: 500.00,
    price_platinum: 850.00,
    deposit_amount: 100.00,
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    document_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    modules: [
      {
        title: 'Introduction to SAP',
        lessons: [
          { title: 'What is SAP?', type: 'video', duration: '5:20', completed: true },
          { title: 'SAP ERP Overview', type: 'reading', duration: '10 mins', completed: true },
        ]
      },
      {
        title: 'SAP Navigation',
        lessons: [
          { title: 'SAP GUI Basics', type: 'video', duration: '15:45', completed: false },
          { title: 'Transaction Codes', type: 'video', duration: '12:30', completed: false },
          { title: 'Module 1 Quiz', type: 'quiz', duration: '15 mins', completed: false },
        ]
      }
    ],
    mode: 'virtual',
    is_published: true,
    instructor_id: 'inst1',
    categories: MOCK_CATEGORIES[0]
  },
  {
    id: 'c2',
    category_id: '1',
    title: 'SAP Advanced Consultant Training',
    slug: 'sap-advanced',
    description: 'Deep dive into SAP implementation, configuration, and advanced consulting techniques.',
    overview: 'This advanced course is designed for those who want to become SAP Consultants. It covers complex configuration, integration between modules, and implementation methodologies like SAP Activate.',
    learning_outcomes: [
      'Configure core SAP modules (FI/CO or MM/SD)',
      'Manage SAP implementation projects',
      'Understand advanced integration scenarios',
      'Prepare for SAP Certification exams'
    ],
    who_it_is_for: [
      'SAP Power Users',
      'Junior SAP Consultants',
      'Business Analysts',
      'Professionals with basic SAP knowledge'
    ],
    duration: '12 Weeks',
    format: 'Blended Learning',
    certification_details: 'MKS Advanced SAP Consultant Diploma',
    price_standard: 1500.00,
    price_platinum: 2200.00,
    deposit_amount: 250.00,
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    document_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    modules: [
      {
        title: 'Implementation Methodologies',
        lessons: [
          { title: 'SAP Activate Framework', type: 'video', duration: '20:00', completed: false },
          { title: 'Agile in SAP Projects', type: 'reading', duration: '15 mins', completed: false },
        ]
      }
    ],
    mode: 'physical',
    is_published: true,
    instructor_id: 'inst1',
    categories: MOCK_CATEGORIES[0]
  },
  {
    id: 'c3',
    category_id: '2',
    title: 'Software Testing Foundation',
    slug: 'software-testing-beginner',
    description: 'Learn the essentials of manual testing, bug reporting, and the software development lifecycle.',
    overview: 'This course covers the fundamental principles of software testing. You will learn how to write test cases, report defects, and understand the role of testing in SDLC.',
    learning_outcomes: [
      'Understand STLC and SDLC',
      'Write effective test cases and plans',
      'Perform functional and regression testing',
      'Master bug reporting tools like Jira'
    ],
    who_it_is_for: [
      'Aspiring QA Engineers',
      'Career changers',
      'Recent graduates',
      'Developers wanting to improve testing skills'
    ],
    duration: '6 Weeks',
    format: 'Online / Self-paced',
    certification_details: 'MKS Software Testing Foundation Certificate',
    price_standard: 450.00,
    price_platinum: 700.00,
    deposit_amount: 50.00,
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    document_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    modules: [
      {
        title: 'Testing Fundamentals',
        lessons: [
          { title: 'Why is Testing Necessary?', type: 'video', duration: '10:00', completed: false },
          { title: 'Seven Testing Principles', type: 'reading', duration: '12 mins', completed: false },
        ]
      }
    ],
    mode: 'vod',
    is_published: true,
    categories: MOCK_CATEGORIES[1]
  },
  {
    id: 'c4',
    category_id: '2',
    title: 'Advanced Test Automation',
    slug: 'software-testing-advanced',
    description: 'Master Selenium, Appium, and API testing to become a high-demand Automation Engineer.',
    overview: 'Take your testing career to the next level with automation. This course focuses on building robust automation frameworks using industry-standard tools.',
    learning_outcomes: [
      'Build Selenium WebDriver frameworks',
      'Perform API testing with Postman and RestAssured',
      'Implement Mobile testing with Appium',
      'Integrate testing into CI/CD pipelines'
    ],
    who_it_is_for: [
      'Manual Testers moving to Automation',
      'QA Engineers',
      'Developers',
      'Technical Lead candidates'
    ],
    duration: '10 Weeks',
    format: 'Live Online Training',
    certification_details: 'MKS Certified Automation Engineer',
    price_standard: 1200.00,
    price_platinum: 1800.00,
    deposit_amount: 200.00,
    image_url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80',
    video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    document_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    modules: [
      {
        title: 'Automation Basics',
        lessons: [
          { title: 'Introduction to Selenium', type: 'video', duration: '15:00', completed: false },
          { title: 'Locators and Selectors', type: 'video', duration: '18:00', completed: false },
        ]
      }
    ],
    mode: 'virtual',
    is_published: true,
    instructor_id: 'inst1',
    categories: MOCK_CATEGORIES[1]
  }
];

export const MOCK_ENROLLMENTS = [
  {
    id: 'e1',
    user_id: 'u1',
    course_id: 'c1',
    package_type: 'platinum',
    status: 'active',
    progress: 45,
    enrolled_at: new Date().toISOString(),
    courses: MOCK_COURSES[0]
  }
];

export const MOCK_FAQS = [
  {
    id: 'f1',
    question: 'How do I enroll in a course?',
    answer: 'You can enroll by selecting a course from our catalog and clicking the "Enroll Now" button. You will be guided through the payment and registration process.',
    order: 1
  },
  {
    id: 'f2',
    question: 'Are the certifications accredited?',
    answer: 'Yes, our courses are accredited by recognized bodies such as SAP, ISTQB, and BCS, ensuring your certification is valued globally.',
    order: 2
  },
  {
    id: 'f3',
    question: 'Can I pay in installments?',
    answer: 'Yes, we offer flexible payment plans for our advanced training programs. You can start with a deposit and pay the balance in installments.',
    order: 3
  }
];

export const MOCK_ANNOUNCEMENTS = [
  {
    id: 'a1',
    title: 'New SAP S/4HANA Batch Starting Soon',
    content: 'We are launching a new SAP S/4HANA Finance batch next month. Early bird discounts available for the first 10 enrollments!',
    type: 'info',
    created_at: new Date().toISOString()
  },
  {
    id: 'a2',
    title: 'System Maintenance',
    content: 'The student portal will be down for scheduled maintenance this Sunday from 2 AM to 4 AM GMT.',
    type: 'warning',
    created_at: new Date().toISOString()
  }
];

export const MOCK_QUIZZES = [
  {
    id: 'q1',
    title: 'SAP Fundamentals Quiz',
    course_id: 'c1',
    description: 'Test your knowledge on basic SAP ERP principles and navigation.',
    questions: [
      {
        question: 'What does SAP stand for?',
        options: ['Systems, Applications, and Products in Data Processing', 'Software and Programming', 'System Analysis and Planning', 'Standard Application Protocol'],
        correct_option: 0
      },
      {
        question: 'Which of the following is a core SAP module?',
        options: ['FI (Financial Accounting)', 'CO (Controlling)', 'MM (Materials Management)', 'All of the above'],
        correct_option: 3
      }
    ],
    created_at: new Date().toISOString()
  }
];

export const MOCK_PAYMENTS = [
  {
    id: 'p1',
    user_id: 'u1',
    enrollment_id: 'e1',
    amount: 100.00,
    payment_status: 'succeeded',
    created_at: new Date().toISOString(),
    enrollments: MOCK_ENROLLMENTS[0],
    profiles: { full_name: 'John Doe', email: 'john@example.com' }
  }
];

export const MOCK_INSTALLMENTS = [
  {
    id: 'i1',
    enrollment_id: 'e1',
    amount: 150.00,
    due_date: new Date(Date.now() + 86400000 * 7).toISOString(),
    status: 'pending',
    enrollments: MOCK_ENROLLMENTS[0],
    profiles: { full_name: 'John Doe' }
  }
];

export const MOCK_COURSE_MATERIALS = [
  {
    id: 'm1',
    course_id: 'c1',
    title: 'SAP Introduction PDF',
    description: 'Basic introduction to SAP ERP systems.',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    type: 'pdf',
    instructor_id: 'i1',
    created_at: new Date().toISOString()
  }
];

export const MOCK_STATS = {
  totalStudents: 1,
  activeEnrollments: 1,
  completedCourses: 0,
  totalRevenue: 100,
  revenueGrowth: 0,
  studentGrowth: 0,
  completionRate: 0,
  activeQuizzes: 1
};

export const MOCK_SITE_SETTINGS = [
  { key: 'site_name', value: 'MKS CONSULTS LIMITED' },
  { key: 'support_email', value: 'support@mksconsultsltd.com' },
  { key: 'contact_number', value: '+44 20 8123 4567' },
  { key: 'hero_headline', value: 'Expert SAP and Software Testing Training.' },
  { key: 'hero_subheadline', value: 'Industry-leading training for SAP Professionals and Software Testers.' },
  { key: 'about_title', value: 'Why Choose MKS Consults?' },
  { key: 'about_content', value: 'We provide high-quality training solutions tailored to your needs. Our experienced instructors ensure you get the best learning experience.' },
  { key: 'office_address', value: '123 Training Street, London, UK' },
  { key: 'facebook_url', value: 'https://facebook.com/mksconsults' },
  { key: 'twitter_url', value: 'https://twitter.com/mksconsults' },
  { key: 'linkedin_url', value: 'https://linkedin.com/company/mksconsults' },
  { key: 'instagram_url', value: 'https://instagram.com/mksconsults' },
  { key: 'hero_bg_url', value: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1920&q=80' },
  { key: 'bank_name', value: 'Barclays Bank' },
  { key: 'account_name', value: 'MKS Consults Ltd' },
  { key: 'account_number', value: '12345678' },
  { key: 'sort_code', value: '20-30-40' },
  { key: 'contact_email_primary', value: 'info@mksconsultsltd.com' },
  { key: 'contact_email_support', value: 'support@mksconsultsltd.com' },
  { key: 'contact_phone', value: '+44 (0) 20 8000 0000' },
  { key: 'contact_address_line1', value: '124 City Road, London' },
  { key: 'contact_address_line2', value: 'EC1V 2NX, United Kingdom' },
  { key: 'working_hours_mon_fri', value: '09:00 - 18:00' },
  { key: 'working_hours_sat', value: '10:00 - 14:00' },
  { key: 'working_hours_sun', value: 'Closed' },
  { key: 'contact_hero_title', value: 'Get in Touch' },
  { key: 'contact_hero_subtitle', value: "Have questions about our courses or corporate solutions? We're here to help you every step of the way." },
  { 
    key: 'privacy_policy', 
    value: `# Privacy Policy
\nAt MKS Consults Ltd, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.
\n## 1. Information Collection
We collect information when you register on our site, enroll in a course, or subscribe to our newsletter. This includes your name, email address, and payment information.
\n## 2. Use of Information
Any information we collect may be used to personalize your experience, improve our website, process transactions, and send periodic emails regarding your training.
\n## 3. Data Protection
We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.` 
  },
  { 
    key: 'terms_of_service', 
    value: `# Terms of Service
\nBy accessing this website, you are agreeing to be bound by these Terms of Service.
\n## 1. Services Provided
MKS Consults Ltd provides professional training in SAP ERP and Software Testing. We reserve the right to modify or discontinue any course or service at any time.
\n## 2. User Conduct
Users are expected to conduct themselves professionally during live sessions and in community forums. Any abuse or violation of intellectual property will result in immediate termination of access without refund.
\n## 3. Limitation of Liability
MKS Consults Ltd shall not be held liable for any damages arising out of the use or inability to use the materials on our website.` 
  },
  { 
    key: 'refund_policy', 
    value: `# Refund Policy
\nWe want you to be satisfied with our training services.
\n## 1. Enrollment Deposits
All deposits paid to secure a seat in a batch are non-refundable but can be moved to a future batch within 6 months.
\n## 2. Full Refunds
A full refund of the course fee (less the deposit) is available if requested at least 7 days before the course start date.
\n## 3. No Refunds
No refunds are issued once the course has commenced or after access to learning materials has been granted.` 
  },
];
