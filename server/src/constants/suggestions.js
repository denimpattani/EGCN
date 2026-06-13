// src/constants/suggestions.js

export const SUGGESTIONS = {
  TIER_A: [ // Below 50%
    "Your target is slipping—push harder today!",
    "Sales are trailing expectations. Let's double down on outreach.",
    "A slow start doesn't dictate the finish. Regain your momentum.",
    "We're off pace. Consider revisiting today's pipeline.",
    "Below target. Focus on closing high-probability deals immediately.",
    "Urgent: Action required to bring today's numbers back in line.",
    "Momentum is key, and we've lost a bit. Time to sprint.",
    "It's not too late to turn this day around. Focus up.",
    "Falling behind the daily requirement. Analyze what's blocking sales.",
    "Critical day. We need an immediate boost in volume to recover."
  ],
  TIER_B: [ // 50-80%
    "Great pace! Keep the momentum going.",
    "Solid progress today. A little more effort hits the target.",
    "You're tracking well. Don't take your foot off the gas.",
    "Steady numbers. Let's aim for a strong finish.",
    "Good, consistent sales flow today. Keep converting.",
    "Within striking distance of today's goal. Push through.",
    "Nice work! A few more closes and we're in the green.",
    "Maintaining a healthy run rate. Keep the energy high.",
    "You've built a good foundation for the day. Finish strong.",
    "Looking decent, but there is still room to excel.",
    "Stable performance. Let's look for one more big win.",
    "You're on the right path. Stay consistent.",
    "A respectable showing today. Let's push for excellent.",
    "Halfway there and moving steadily.",
    "Keep this rhythm up, you are doing well.",
    "You are trending towards a positive day.",
    "Good traction. Keep leveraging your strengths.",
    "Not bad at all. Let's secure the final stretch.",
    "You've secured the baseline, now let's build on it.",
    "Moving in the right direction. Stay focused on closing."
  ],
  TIER_C: [ // 80-100%
    "Outstanding! Can you hit 105% today?",
    "Brilliant day! You are right on the money.",
    "Exceptional performance. You're practically there.",
    "Target is in sight! Secure the final deals.",
    "Fantastic momentum! Let's cross the finish line.",
    "You are crushing today's numbers. Superb work.",
    "Very close to your daily goal. Bring it home!",
    "Great conversion rate today. Keep it up.",
    "Almost perfect execution. Finish the day on a high.",
    "Excellent run rate. Let's exceed the expectations.",
    "Top-tier performance today. Be proud of the hustle.",
    "You've clearly mastered today's pipeline. Great job.",
    "Hitting all the right notes today. Keep smiling and selling.",
    "You're proving that the targets are well within reach.",
    "Stellar work! Let's aim to overflow the target."
  ],
  TIER_D: [ // >100%
    "Incredible! You've completely smashed today's target.",
    "Over 100%! This is what elite performance looks like.",
    "Record-breaking pace today. Take a bow.",
    "Absolutely phenomenal. You've outdone yourself.",
    "Target obliterated! Keep this energy for tomorrow."
  ]
};

export const getSuggestionByAchievement = (achievedPct) => {
  let pool = [];
  if (achievedPct < 50) {
    pool = SUGGESTIONS.TIER_A;
  } else if (achievedPct < 80) {
    pool = SUGGESTIONS.TIER_B;
  } else if (achievedPct <= 100) {
    pool = SUGGESTIONS.TIER_C;
  } else {
    pool = SUGGESTIONS.TIER_D;
  }
  
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
};
