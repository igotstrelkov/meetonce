export const INTERESTS = [
  "Hiking", "Reading", "Cooking", "Travel", "Fitness",
  "Photography", "Music", "Art", "Gaming", "Dancing",
  "Yoga", "Running", "Cycling", "Swimming", "Tennis",
  "Coffee", "Wine", "Craft Beer", "Foodie", "Vegetarian",
  "Volunteering", "Entrepreneurship", "Tech", "Science", "History",
  "Movies", "TV Shows", "Theater", "Concerts", "Festivals",
  "Pets", "Dogs", "Cats", "Nature", "Camping",
] as const;

export const PASS_REASONS = [
  "too_far",
  "lifestyle",
  "attraction",
  "profile",
  "dealbreaker",
  "no_chemistry",
] as const;

export const REJECTION_CATEGORIES = [
  { value: "inappropriate", label: "Inappropriate Content" },
  { value: "no_face", label: "No Clear Face Visible" },
  { value: "group_photo", label: "Group Photo" },
  { value: "poor_quality", label: "Poor Quality" },
  { value: "filtered", label: "Heavily Filtered" },
  { value: "celebrity", label: "Celebrity/Stock Photo" },
  { value: "child", label: "Contains Child" },
  { value: "other", label: "Other" },
];

export const COUNTRIES = [
  { value: "dublin", label: "Dublin" },
]

export const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
]
  