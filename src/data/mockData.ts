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
    is_published: true,
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
    is_published: true,
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
    is_published: true,
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
    answer: 'Yes, all our courses are accredited by recognized awarding bodies such as TQUK, City & Guilds, and SIA.',
    order: 2
  },
  {
    id: 'f3',
    question: 'Can I pay in installments?',
    answer: 'Yes, we offer flexible payment plans for most of our diploma courses. Please contact our support team for more details.',
    order: 3
  }
];

export const MOCK_ANNOUNCEMENTS = [
  {
    id: 'a1',
    title: 'New SIA Course Starting Soon',
    content: 'We are launching a new SIA Door Supervision course next month. Early bird discounts available!',
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
    title: 'Health & Safety Basics',
    course_id: 'level-3-adult-care',
    description: 'Test your knowledge on basic health and safety principles in the workplace.',
    questions: [
      {
        question: 'What does PPE stand for?',
        options: ['Personal Protective Equipment', 'Private Property Entrance', 'Public Protection Event', 'Personal Policy Enforcement'],
        correct_option: 0
      },
      {
        question: 'Who is responsible for health and safety at work?',
        options: ['The Employer', 'The Employee', 'Both Employer and Employee', 'The Government'],
        correct_option: 2
      }
    ],
    created_at: new Date().toISOString()
  }
];
