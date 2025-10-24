/**
 * Community Impact Score (CoIS) - Mock Data
 * Sample community organizer data for testing the CoIS system
 */

import type { OrganizerRawMetrics } from './types';

export const MOCK_ORGANIZERS: OrganizerRawMetrics[] = [
  {
    organizerId: 'react-native-london',
    name: 'React Native London',
    location: 'London, UK',
    eventTypes: ['meetup', 'workshop'],
    collected_at: new Date().toISOString(),

    // Event Reach & Frequency
    total_attendees_12mo: 1200,
    unique_attendees_12mo: 650,
    events_held_12mo: 12,
    virtual_attendee_ratio: 0.15,
    average_event_size: 100,

    // Community Health
    repeat_attendee_rate: 0.65,
    code_of_conduct_score: 0.95,
    diversity_index: 0.72,
    first_timer_welcome_score: 0.90,
    attendee_satisfaction: 0.88,

    // Content Quality
    speaker_diversity_score: 0.80,
    talk_quality_rating: 0.85,
    react_relevance_score: 0.95,
    post_event_resources: 45,
    speaker_seniority_score: 0.75,

    // Ecosystem Growth
    new_contributors_generated: 28,
    job_placements: 15,
    cross_community_collaborations: 5,
    sponsor_diversity: 8,
    attendee_ris_contributions: 42,

    // Sustainability
    years_active: 7,
    organizer_count: 4,
    organizer_turnover_rate: 0.15,
    financial_health_score: 0.85,
    succession_plan_score: 0.80,
  },
  {
    organizerId: 'react-conf',
    name: 'React Conf',
    location: 'Las Vegas, USA',
    eventTypes: ['conference'],
    collected_at: new Date().toISOString(),

    // Event Reach & Frequency
    total_attendees_12mo: 5000,
    unique_attendees_12mo: 4800,
    events_held_12mo: 1,
    virtual_attendee_ratio: 0.40,
    average_event_size: 5000,

    // Community Health
    repeat_attendee_rate: 0.35,
    code_of_conduct_score: 0.98,
    diversity_index: 0.85,
    first_timer_welcome_score: 0.92,
    attendee_satisfaction: 0.95,

    // Content Quality
    speaker_diversity_score: 0.90,
    talk_quality_rating: 0.95,
    react_relevance_score: 1.0,
    post_event_resources: 120,
    speaker_seniority_score: 0.85,

    // Ecosystem Growth
    new_contributors_generated: 180,
    job_placements: 85,
    cross_community_collaborations: 25,
    sponsor_diversity: 30,
    attendee_ris_contributions: 320,

    // Sustainability
    years_active: 10,
    organizer_count: 15,
    organizer_turnover_rate: 0.10,
    financial_health_score: 0.95,
    succession_plan_score: 0.90,
  },
  {
    organizerId: 'reactjs-sf-bay-area',
    name: 'ReactJS SF Bay Area',
    location: 'San Francisco, USA',
    eventTypes: ['meetup', 'workshop', 'hackathon'],
    collected_at: new Date().toISOString(),

    // Event Reach & Frequency
    total_attendees_12mo: 2400,
    unique_attendees_12mo: 1100,
    events_held_12mo: 18,
    virtual_attendee_ratio: 0.25,
    average_event_size: 133,

    // Community Health
    repeat_attendee_rate: 0.58,
    code_of_conduct_score: 0.90,
    diversity_index: 0.68,
    first_timer_welcome_score: 0.85,
    attendee_satisfaction: 0.82,

    // Content Quality
    speaker_diversity_score: 0.75,
    talk_quality_rating: 0.88,
    react_relevance_score: 0.92,
    post_event_resources: 65,
    speaker_seniority_score: 0.80,

    // Ecosystem Growth
    new_contributors_generated: 45,
    job_placements: 32,
    cross_community_collaborations: 8,
    sponsor_diversity: 12,
    attendee_ris_contributions: 78,

    // Sustainability
    years_active: 8,
    organizer_count: 6,
    organizer_turnover_rate: 0.20,
    financial_health_score: 0.88,
    succession_plan_score: 0.75,
  },
  {
    organizerId: 'react-lagos',
    name: 'React Lagos',
    location: 'Lagos, Nigeria',
    eventTypes: ['meetup', 'workshop'],
    collected_at: new Date().toISOString(),

    // Event Reach & Frequency
    total_attendees_12mo: 850,
    unique_attendees_12mo: 520,
    events_held_12mo: 10,
    virtual_attendee_ratio: 0.30,
    average_event_size: 85,

    // Community Health
    repeat_attendee_rate: 0.72,
    code_of_conduct_score: 0.88,
    diversity_index: 0.85,
    first_timer_welcome_score: 0.95,
    attendee_satisfaction: 0.90,

    // Content Quality
    speaker_diversity_score: 0.90,
    talk_quality_rating: 0.80,
    react_relevance_score: 0.88,
    post_event_resources: 32,
    speaker_seniority_score: 0.70,

    // Ecosystem Growth
    new_contributors_generated: 35,
    job_placements: 18,
    cross_community_collaborations: 4,
    sponsor_diversity: 5,
    attendee_ris_contributions: 25,

    // Sustainability
    years_active: 4,
    organizer_count: 3,
    organizer_turnover_rate: 0.25,
    financial_health_score: 0.70,
    succession_plan_score: 0.65,
  },
  {
    organizerId: 'small-react-meetup',
    name: 'Small React Meetup',
    location: 'Boulder, USA',
    eventTypes: ['meetup'],
    collected_at: new Date().toISOString(),

    // Event Reach & Frequency
    total_attendees_12mo: 240,
    unique_attendees_12mo: 150,
    events_held_12mo: 8,
    virtual_attendee_ratio: 0.10,
    average_event_size: 30,

    // Community Health
    repeat_attendee_rate: 0.80,
    code_of_conduct_score: 0.75,
    diversity_index: 0.60,
    first_timer_welcome_score: 0.85,
    attendee_satisfaction: 0.88,

    // Content Quality
    speaker_diversity_score: 0.65,
    talk_quality_rating: 0.78,
    react_relevance_score: 0.90,
    post_event_resources: 12,
    speaker_seniority_score: 0.60,

    // Ecosystem Growth
    new_contributors_generated: 8,
    job_placements: 3,
    cross_community_collaborations: 1,
    sponsor_diversity: 2,
    attendee_ris_contributions: 5,

    // Sustainability
    years_active: 2,
    organizer_count: 2,
    organizer_turnover_rate: 0.30,
    financial_health_score: 0.65,
    succession_plan_score: 0.50,
  },
];
