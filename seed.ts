import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding database...');

  // 1. Categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .upsert([
      { name: 'SAP Training', slug: 'sap-training', description: 'Professional SAP ERP training for all levels.' },
      { name: 'Software Testing', slug: 'software-testing', description: 'Manual and Automation testing courses.' }
    ], { onConflict: 'slug' })
    .select();

  if (catError) {
    console.error('Error seeding categories:', catError);
    return;
  }
  console.log('Categories seeded.');

  const catMap = categories.reduce((acc: any, cat: any) => {
    acc[cat.slug] = cat.id;
    return acc;
  }, {});

  // 2. Courses
  const { error: courseError } = await supabase
    .from('courses')
    .upsert([
      {
        title: 'SAP Beginner Course',
        slug: 'sap-beginner',
        category_id: catMap['sap-training'],
        description: 'Master the fundamentals of SAP ERP.',
        overview: 'This course provides a comprehensive introduction to SAP ERP.',
        price_standard: 500,
        price_platinum: 850,
        deposit_amount: 100,
        duration: '4 Weeks',
        format: 'Online / Live Sessions',
        is_published: true,
        image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        learning_outcomes: ['Understand SAP ERP architecture', 'Navigate the SAP GUI', 'Perform basic transactions'],
        who_it_is_for: ['Graduates', 'Career changers']
      },
      {
        title: 'SAP Advanced Consultant Training',
        slug: 'sap-advanced',
        category_id: catMap['sap-training'],
        description: 'Deep dive into SAP implementation and configuration.',
        overview: 'This advanced course is designed for those who want to become SAP Consultants.',
        price_standard: 1500,
        price_platinum: 2200,
        deposit_amount: 250,
        duration: '12 Weeks',
        format: 'Blended Learning',
        is_published: true,
        image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        learning_outcomes: ['Configure core SAP modules', 'Manage implementation projects'],
        who_it_is_for: ['SAP Power Users', 'Junior Consultants']
      },
      {
        title: 'Software Testing Foundation',
        slug: 'software-testing-beginner',
        category_id: catMap['software-testing'],
        description: 'Learn the essentials of manual testing.',
        overview: 'This course covers the fundamental principles of software testing.',
        price_standard: 450,
        price_platinum: 700,
        deposit_amount: 50,
        duration: '6 Weeks',
        format: 'Online',
        is_published: true,
        image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
        learning_outcomes: ['Understand STLC and SDLC', 'Write test cases', 'Bug reporting'],
        who_it_is_for: ['Aspiring QA Engineers']
      },
      {
        title: 'Advanced Test Automation',
        slug: 'software-testing-advanced',
        category_id: catMap['software-testing'],
        description: 'Master Selenium and API testing.',
        overview: 'Take your testing career to the next level with automation.',
        price_standard: 1200,
        price_platinum: 1800,
        deposit_amount: 200,
        duration: '10 Weeks',
        format: 'Live Online Training',
        is_published: true,
        image_url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80',
        learning_outcomes: ['Build Selenium frameworks', 'API testing', 'CI/CD integration'],
        who_it_is_for: ['Manual Testers', 'QA Engineers']
      }
    ], { onConflict: 'slug' });

  if (courseError) {
    console.error('Error seeding courses:', courseError);
    return;
  }
  console.log('Courses seeded.');

  console.log('Seeding complete!');
}

seed();
