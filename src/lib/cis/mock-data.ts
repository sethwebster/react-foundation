/**
 * Content Impact Score (CIS) - Mock Data
 * Sample educator data for testing the CIS system
 */

import type { EducatorRawMetrics } from './types';

/**
 * Mock educator data representing various types of React educators
 */
export const MOCK_EDUCATORS: EducatorRawMetrics[] = [
  {
    // Kent C. Dodds - Top tier educator with paid courses and free content
    educatorId: 'kent-c-dodds',
    name: 'Kent C. Dodds',
    platforms: ['epicreact.dev', 'youtube', 'twitter', 'blog'],
    collected_at: new Date().toISOString(),

    // Educational Reach
    video_views_12mo: 2_500_000,
    unique_learners: 150_000,
    course_enrollments: 45_000,
    article_reads_12mo: 1_800_000,
    geographic_countries: 120,

    // Content Quality & Correctness
    peer_review_score: 0.95,
    code_quality_score: 0.92,
    community_upvotes: 15_000,
    react_docs_alignment: 0.95,
    accuracy_report_ratio: 0.005, // Very few accuracy issues

    // Learning Outcomes
    completion_rate: 0.75,
    avg_time_spent_minutes: 180,
    student_feedback_score: 0.92,
    student_ris_contributions: 450,
    student_career_growth: 0.75,

    // Community Teaching Impact
    free_content_ratio: 0.60, // 60% free, 40% paid
    accessibility_score: 0.90,
    mentorship_hours: 40,
    beginner_content_ratio: 0.35,

    // Consistency & Longevity
    publishing_frequency_days: 14,
    content_freshness_score: 0.90,
    years_teaching: 8,
    update_velocity: 2.5,
  },
  {
    // Web Dev Simplified - YouTube-focused educator with beginner content
    educatorId: 'web-dev-simplified',
    name: 'Kyle Cook (Web Dev Simplified)',
    platforms: ['youtube', 'webdevsimplified.com', 'courses'],
    collected_at: new Date().toISOString(),

    // Educational Reach
    video_views_12mo: 15_000_000,
    unique_learners: 800_000,
    course_enrollments: 12_000,
    article_reads_12mo: 400_000,
    geographic_countries: 150,

    // Content Quality & Correctness
    peer_review_score: 0.88,
    code_quality_score: 0.90,
    community_upvotes: 45_000,
    react_docs_alignment: 0.85,
    accuracy_report_ratio: 0.008,

    // Learning Outcomes
    completion_rate: 0.65,
    avg_time_spent_minutes: 20,
    student_feedback_score: 0.90,
    student_ris_contributions: 120,
    student_career_growth: 0.60,

    // Community Teaching Impact
    free_content_ratio: 0.90, // Mostly free YouTube content
    accessibility_score: 0.95,
    mentorship_hours: 10,
    beginner_content_ratio: 0.80,

    // Consistency & Longevity
    publishing_frequency_days: 4,
    content_freshness_score: 0.85,
    years_teaching: 6,
    update_velocity: 3.0,
  },
  {
    // Theo (t3.gg) - Modern stack educator with strong opinions
    educatorId: 'theo-t3gg',
    name: 'Theo Browne',
    platforms: ['youtube', 'twitter', 't3.gg', 'twitch'],
    collected_at: new Date().toISOString(),

    // Educational Reach
    video_views_12mo: 8_000_000,
    unique_learners: 500_000,
    course_enrollments: 5_000,
    article_reads_12mo: 300_000,
    geographic_countries: 95,

    // Content Quality & Correctness
    peer_review_score: 0.82,
    code_quality_score: 0.88,
    community_upvotes: 25_000,
    react_docs_alignment: 0.80,
    accuracy_report_ratio: 0.012,

    // Learning Outcomes
    completion_rate: 0.55,
    avg_time_spent_minutes: 35,
    student_feedback_score: 0.85,
    student_ris_contributions: 200,
    student_career_growth: 0.70,

    // Community Teaching Impact
    free_content_ratio: 0.95, // Mostly free content
    accessibility_score: 0.75,
    mentorship_hours: 15,
    beginner_content_ratio: 0.40,

    // Consistency & Longevity
    publishing_frequency_days: 3,
    content_freshness_score: 0.95,
    years_teaching: 4,
    update_velocity: 4.0,
  },
  {
    // Josh Comeau - High-quality paid courses with interactive learning
    educatorId: 'josh-comeau',
    name: 'Josh Comeau',
    platforms: ['joshwcomeau.com', 'courses', 'blog', 'twitter'],
    collected_at: new Date().toISOString(),

    // Educational Reach
    video_views_12mo: 500_000,
    unique_learners: 80_000,
    course_enrollments: 18_000,
    article_reads_12mo: 2_500_000,
    geographic_countries: 110,

    // Content Quality & Correctness
    peer_review_score: 0.96,
    code_quality_score: 0.95,
    community_upvotes: 18_000,
    react_docs_alignment: 0.92,
    accuracy_report_ratio: 0.003,

    // Learning Outcomes
    completion_rate: 0.82,
    avg_time_spent_minutes: 240,
    student_feedback_score: 0.96,
    student_ris_contributions: 320,
    student_career_growth: 0.80,

    // Community Teaching Impact
    free_content_ratio: 0.40, // Excellent paid courses, some free blog
    accessibility_score: 0.98,
    mentorship_hours: 20,
    beginner_content_ratio: 0.55,

    // Consistency & Longevity
    publishing_frequency_days: 30,
    content_freshness_score: 0.88,
    years_teaching: 5,
    update_velocity: 1.5,
  },
  {
    // Lee Robinson (Vercel) - Next.js and React ecosystem educator
    educatorId: 'lee-robinson',
    name: 'Lee Robinson',
    platforms: ['youtube', 'leerob.io', 'twitter', 'vercel'],
    collected_at: new Date().toISOString(),

    // Educational Reach
    video_views_12mo: 3_500_000,
    unique_learners: 250_000,
    course_enrollments: 8_000,
    article_reads_12mo: 1_200_000,
    geographic_countries: 130,

    // Content Quality & Correctness
    peer_review_score: 0.90,
    code_quality_score: 0.93,
    community_upvotes: 20_000,
    react_docs_alignment: 0.90,
    accuracy_report_ratio: 0.006,

    // Learning Outcomes
    completion_rate: 0.68,
    avg_time_spent_minutes: 45,
    student_feedback_score: 0.88,
    student_ris_contributions: 280,
    student_career_growth: 0.72,

    // Community Teaching Impact
    free_content_ratio: 0.85, // Mostly free content
    accessibility_score: 0.88,
    mentorship_hours: 25,
    beginner_content_ratio: 0.45,

    // Consistency & Longevity
    publishing_frequency_days: 7,
    content_freshness_score: 0.92,
    years_teaching: 7,
    update_velocity: 3.5,
  },
  {
    // Smaller educator - Good content but less reach
    educatorId: 'react-educator-small',
    name: 'React Educator (Small)',
    platforms: ['youtube', 'blog'],
    collected_at: new Date().toISOString(),

    // Educational Reach
    video_views_12mo: 150_000,
    unique_learners: 15_000,
    course_enrollments: 500,
    article_reads_12mo: 50_000,
    geographic_countries: 45,

    // Content Quality & Correctness
    peer_review_score: 0.75,
    code_quality_score: 0.80,
    community_upvotes: 800,
    react_docs_alignment: 0.78,
    accuracy_report_ratio: 0.015,

    // Learning Outcomes
    completion_rate: 0.60,
    avg_time_spent_minutes: 25,
    student_feedback_score: 0.82,
    student_ris_contributions: 15,
    student_career_growth: 0.55,

    // Community Teaching Impact
    free_content_ratio: 1.0, // All free
    accessibility_score: 0.70,
    mentorship_hours: 5,
    beginner_content_ratio: 0.75,

    // Consistency & Longevity
    publishing_frequency_days: 21,
    content_freshness_score: 0.75,
    years_teaching: 2,
    update_velocity: 1.0,
  },
];

/**
 * Generate a complete quarterly allocation with mock data
 */
export function generateMockQuarterlyAllocation() {
  // This would typically be imported and used with CISScoringService
  // Example usage in tests or demos
  return {
    period: '2025-Q1',
    total_pool_usd: 100_000,
    educators: MOCK_EDUCATORS,
  };
}
