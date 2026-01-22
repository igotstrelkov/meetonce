import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { generateEmbedding } from "./lib/openrouter";

// Test user profiles
const TEST_USERS = [
  {
    name: "Sarah Johnson",
    age: 28,
    gender: "female",
    interestedIn: "male",
    location: "Dublin",
    bio: "Software engineer who loves hiking and trying new restaurants. Weekend warrior on the mountains, weekday coffee enthusiast. Always up for spontaneous adventures or cozy nights with a good book.",
    lookingFor:
      "Someone who can appreciate both quiet evenings and exciting adventures. Must love dogs and have a good sense of humor.",
    interests: [
      "Hiking",
      "Cooking",
      "Reading",
      "Coffee",
      "Travel",
      "Photography",
    ],
    minAge: 26,
    maxAge: 35,
    jobTitle: "Software Engineer",
  },
  {
    name: "Emma Murphy",
    age: 31,
    gender: "female",
    interestedIn: "male",
    location: "Dublin",
    bio: "Marketing manager with a passion for yoga and sustainable living. Plant mom to 15 succulents. Love exploring farmers markets and finding the best brunch spots in the city.",
    lookingFor:
      "Looking for someone environmentally conscious who enjoys staying active and trying new things. Bonus points if you can keep a plant alive.",
    interests: [
      "Yoga",
      "Sustainability",
      "Brunch",
      "Plants",
      "Reading",
      "Cycling",
    ],
    minAge: 28,
    maxAge: 38,
    jobTitle: "Marketing Manager",
  },
  {
    name: "Aoife O'Brien",
    age: 26,
    gender: "female",
    interestedIn: "male",
    location: "Dublin",
    bio: "Graphic designer who loves art galleries, indie music, and creative projects. Always have paint under my nails. Weekend DJ at local cafes. Passionate about Irish culture and design.",
    lookingFor:
      "Someone creative who appreciates art and music. Looking for genuine connections and meaningful conversations over pretentious small talk.",
    interests: ["Art", "Music", "Design", "Concerts", "Museums", "Coffee"],
    minAge: 24,
    maxAge: 32,
    jobTitle: "Graphic Designer",
  },
  {
    name: "Michael Chen",
    age: 29,
    gender: "male",
    interestedIn: "female",
    location: "Dublin",
    bio: "Data scientist who loves rock climbing and board games. Cooking ambitious recipes on weekends. Always planning the next climbing trip. Believer in work-life balance and trying new experiences.",
    lookingFor:
      "Someone adventurous who doesn't mind a bit of competition in board games. Ideally someone who wants to explore the world together.",
    interests: [
      "Rock Climbing",
      "Board Games",
      "Cooking",
      "Hiking",
      "Travel",
      "Tech",
    ],
    minAge: 25,
    maxAge: 33,
    jobTitle: "Data Scientist",
  },
  {
    name: "James Walsh",
    age: 32,
    gender: "male",
    interestedIn: "female",
    location: "Dublin",
    bio: "Teacher and amateur photographer. Spend weekends exploring hidden gems around Ireland with my camera. Love live music, craft beer, and good conversation. Big on sustainability and local communities.",
    lookingFor:
      "Someone who values authenticity and isn't afraid to be themselves. Looking for a partner in crime for weekend adventures and weeknight Netflix sessions.",
    interests: [
      "Photography",
      "Music",
      "Beer",
      "Travel",
      "Teaching",
      "Sustainability",
    ],
    minAge: 27,
    maxAge: 36,
    jobTitle: "Teacher",
  },
  {
    name: "Liam O'Sullivan",
    age: 27,
    gender: "male",
    interestedIn: "female",
    location: "Dublin",
    bio: "Fitness coach who believes in balance - gym sessions followed by pizza nights. Love the outdoors, running marathons, and coaching local sports teams. Big foodie who's always trying new cuisines.",
    lookingFor:
      "Someone active who enjoys both fitness and food. Looking for someone to share healthy habits and indulgent treats with equal enthusiasm.",
    interests: ["Fitness", "Running", "Coaching", "Food", "Outdoors", "Sports"],
    minAge: 24,
    maxAge: 32,
    jobTitle: "Fitness Coach",
  },
  {
    name: "Chloe Murphy",
    age: 30,
    gender: "female",
    interestedIn: "male",
    location: "Dublin",
    bio: "Journalist covering tech and startups. Love storytelling, whether through writing or photography. Weekend explorer of bookshops and vintage stores. Coffee addict with strong opinions on the best roasters.",
    lookingFor:
      "Someone intellectually curious who loves deep conversations. Must appreciate good coffee, better books, and spontaneous road trips.",
    interests: [
      "Writing",
      "Photography",
      "Books",
      "Coffee",
      "Tech",
      "Vintage Shopping",
    ],
    minAge: 27,
    maxAge: 36,
    jobTitle: "Journalist",
  },
  {
    name: "Sophie Byrne",
    age: 25,
    gender: "female",
    interestedIn: "male",
    location: "Dublin",
    bio: "Environmental scientist passionate about sustainability and ocean conservation. Spend free time surfing, volunteering, and trying to save the planet one reusable cup at a time. Love camping and beach cleanups.",
    lookingFor:
      "Someone who cares about the environment and wants to make a difference. Bonus if you surf or are willing to learn!",
    interests: [
      "Surfing",
      "Sustainability",
      "Volunteering",
      "Camping",
      "Ocean Conservation",
      "Hiking",
    ],
    minAge: 23,
    maxAge: 30,
    jobTitle: "Environmental Scientist",
  },
  {
    name: "Patrick Doyle",
    age: 34,
    gender: "male",
    interestedIn: "female",
    location: "Dublin",
    bio: "Architect with a love for history and design. Weekends are for exploring castles, sketching old buildings, and finding the best pub sessions. Enjoy a good whiskey and better conversation.",
    lookingFor:
      "Looking for someone who appreciates history, architecture, and Irish culture. Someone who can hold their own in a pub quiz and doesn't mind getting lost exploring new places.",
    interests: [
      "Architecture",
      "History",
      "Drawing",
      "Whiskey",
      "Pubs",
      "Travel",
    ],
    minAge: 28,
    maxAge: 38,
    jobTitle: "Architect",
  },
  {
    name: "Daniel Murphy",
    age: 30,
    gender: "male",
    interestedIn: "female",
    location: "Dublin",
    bio: "Product manager at a startup. Love building things, whether it's products or furniture. Spend weekends woodworking, playing guitar, or at the beach. Big believer in the importance of good design.",
    lookingFor:
      "Someone creative and ambitious who isn't afraid to try new things. Looking for someone to build a life with, literally and figuratively.",
    interests: ["Woodworking", "Guitar", "Beach", "Design", "Startups", "DIY"],
    minAge: 26,
    maxAge: 35,
    jobTitle: "Product Manager",
  },
  {
    name: "Rachel Kelly",
    age: 29,
    gender: "female",
    interestedIn: "male",
    location: "Dublin",
    bio: "Veterinarian who spends days saving animals and nights binge-watching documentaries. Love nature, wildlife photography, and camping. Have a rescue dog who's my adventure buddy.",
    lookingFor:
      "Animal lover essential! Looking for someone kind, patient, and up for outdoor adventures. Must be okay with dog hair on everything.",
    interests: [
      "Animals",
      "Wildlife",
      "Photography",
      "Camping",
      "Documentaries",
      "Hiking",
    ],
    minAge: 26,
    maxAge: 35,
    jobTitle: "Veterinarian",
  },
  {
    name: "Conor Fitzgerald",
    age: 28,
    gender: "male",
    interestedIn: "female",
    location: "Dublin",
    bio: "Civil engineer who loves solving problems and building things. Weekends are for rugby, craft beer, and exploring the countryside. Enjoy cooking elaborate dinners and hosting friends.",
    lookingFor:
      "Someone social and fun who doesn't take life too seriously. Looking for someone to share adventures, laughs, and hopefully a love of rugby.",
    interests: ["Rugby", "Engineering", "Cooking", "Beer", "Hosting", "Hiking"],
    minAge: 25,
    maxAge: 33,
    jobTitle: "Civil Engineer",
  },
  {
    name: "Katie O'Connor",
    age: 27,
    gender: "female",
    interestedIn: "male",
    location: "Dublin",
    bio: "Nurse with a big heart and bigger laugh. Love true crime podcasts, baking, and pub quizzes. Equally comfortable in hiking boots or heels. Value kindness, humor, and genuine connections.",
    lookingFor:
      "Someone genuine who makes me laugh and can handle my true crime obsession. Looking for someone to bake with, explore with, and build something real.",
    interests: [
      "Nursing",
      "Baking",
      "Podcasts",
      "Hiking",
      "Pub Quizzes",
      "True Crime",
    ],
    minAge: 25,
    maxAge: 32,
    jobTitle: "Nurse",
  },
  {
    name: "Niamh Ryan",
    age: 26,
    gender: "female",
    interestedIn: "male",
    location: "Dublin",
    bio: "Physiotherapist who practices what I preach - active lifestyle, mindfulness, and self-care. Love Pilates, healthy cooking, and weekend wellness retreats. Big on personal growth and positive vibes.",
    lookingFor:
      "Someone health-conscious and emotionally mature. Looking for a genuine connection with someone who values wellness and personal development.",
    interests: [
      "Pilates",
      "Wellness",
      "Cooking",
      "Mindfulness",
      "Health",
      "Personal Development",
    ],
    minAge: 24,
    maxAge: 31,
    jobTitle: "Physiotherapist",
  },
  {
    name: "Seán Brennan",
    age: 31,
    gender: "male",
    interestedIn: "female",
    location: "Dublin",
    bio: "Secondary school teacher and GAA coach. Passionate about education, sports, and Irish culture. Spend summers traveling and school year coaching local teams. Love traditional music sessions.",
    lookingFor:
      "Someone who values education, community, and Irish heritage. Looking for a teammate in life who's up for both GAA matches and quiet nights in.",
    interests: [
      "Teaching",
      "GAA",
      "Coaching",
      "Irish Culture",
      "Music",
      "Travel",
    ],
    minAge: 26,
    maxAge: 35,
    jobTitle: "Teacher",
  },
  {
    name: "Tom Anderson",
    age: 33,
    gender: "male",
    interestedIn: "female",
    location: "Dublin",
    bio: "Financial analyst by day, amateur chef by night. Love experimenting with new recipes and hosting dinner parties. Enjoy running, reading, and planning my next travel adventure. Believer in work hard, play harder.",
    lookingFor:
      "Someone who appreciates good food and better company. Looking for a partner who's ambitious, adventurous, and doesn't mind being a taste tester.",
    interests: ["Cooking", "Finance", "Running", "Travel", "Reading", "Wine"],
    minAge: 28,
    maxAge: 38,
    jobTitle: "Financial Analyst",
  },
  {
    name: "Grace Dunne",
    age: 28,
    gender: "female",
    interestedIn: "male",
    location: "Dublin",
    bio: "HR manager who genuinely cares about people. Love yoga, meditation, and personal development. Spend weekends at farmers markets, trying new cafes, and planning wellness retreats. Big on communication.",
    lookingFor:
      "Emotionally intelligent person who values open communication and personal growth. Looking for someone to grow with, not just someone to pass time with.",
    interests: [
      "HR",
      "Yoga",
      "Meditation",
      "Wellness",
      "Farmers Markets",
      "Communication",
    ],
    minAge: 26,
    maxAge: 34,
    jobTitle: "HR Manager",
  },
  {
    name: "Oisín McCarthy",
    age: 29,
    gender: "male",
    interestedIn: "female",
    location: "Dublin",
    bio: "UX designer obsessed with creating beautiful, user-friendly experiences. Spend weekends sketching, visiting design exhibitions, and exploring coffee shops for inspiration. Love minimalism and clean design.",
    lookingFor:
      "Creative soul who appreciates good design and better coffee. Looking for someone thoughtful, curious, and up for spontaneous adventures.",
    interests: ["Design", "UX", "Coffee", "Art", "Minimalism", "Sketching"],
    minAge: 25,
    maxAge: 33,
    jobTitle: "UX Designer",
  },
  {
    name: "Ciara Walsh",
    age: 30,
    gender: "female",
    interestedIn: "male",
    location: "Dublin",
    bio: "Event planner who loves bringing people together. Always organizing something - dinners, hikes, game nights. Love music festivals, dancing, and meeting new people. Social butterfly who values deep connections.",
    lookingFor:
      "Social person who enjoys meeting new people but also values quality time together. Looking for someone spontaneous, fun, and ready for adventure.",
    interests: [
      "Event Planning",
      "Music Festivals",
      "Dancing",
      "Socializing",
      "Travel",
      "Organizing",
    ],
    minAge: 27,
    maxAge: 35,
    jobTitle: "Event Planner",
  },
  {
    name: "Brian Kavanagh",
    age: 32,
    gender: "male",
    interestedIn: "female",
    location: "Dublin",
    bio: "Mechanical engineer working on renewable energy projects. Passionate about sustainability and innovation. Love cycling, camping, and DIY projects. Spend weekends building things or exploring nature.",
    lookingFor:
      "Someone who cares about making the world better. Looking for an adventurous partner who's equally comfortable camping in the wild or working on projects together.",
    interests: [
      "Engineering",
      "Sustainability",
      "Cycling",
      "Camping",
      "DIY",
      "Renewable Energy",
    ],
    minAge: 27,
    maxAge: 37,
    jobTitle: "Mechanical Engineer",
  },
];

export const seedTestUsers = internalAction({
  args: {
    count: v.optional(v.number()), // How many users to seed (default: all)
    approved: v.optional(v.boolean()), // Auto-approve users for matching (default: true)
  },
  handler: async (
    ctx,
    args
  ): Promise<{ success: number; errors: number; total: number }> => {
    const count = args.count || TEST_USERS.length;
    const approved = args.approved !== false; // Default to true
    const usersToSeed = TEST_USERS.slice(0, count);

    console.log(
      `🌱 Seeding ${usersToSeed.length} test users (approved: ${approved})...`
    );

    let successCount = 0;
    let errorCount = 0;

    for (const user of usersToSeed) {
      try {
        // Generate embedding from bio and lookingFor
        const profileText = `${user.bio}\n\nLooking for ${user.lookingFor}`;
        const embedding = await generateEmbedding(profileText);

        // Create user with fake Clerk ID
        const userId = await ctx.runMutation(
          internal.users.internalCreateUser,
          {
            clerkId: `test_${user.name.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`,
            email: `${user.name.toLowerCase().replace(/\s+/g, ".")}@test.meetonce.com`,
            name: user.name,
            age: user.age,
            gender: user.gender,
            location: user.location,
            bio: user.bio,
            jobTitle: user.jobTitle,
            lookingFor: user.lookingFor,
            interests: user.interests,
            interestedIn: user.interestedIn,
            minAge: user.minAge,
            maxAge: user.maxAge,
            photoStorageId: undefined, // No photos for test users
            verificationDocStorageId: undefined, // No documents for test users
            embedding,
          }
        );

        // Approve user if requested
        if (approved) {
          await ctx.runMutation(internal.users.internalUpdateAccountStatus, {
            userId,
            accountStatus: "approved",
            attractivenessRating: Math.floor(Math.random() * 3) + 6, // Random rating 6-8
          });
        }

        successCount++;
        console.log(
          `✅ Created user: ${user.name}${approved ? " (approved)" : ""}`
        );
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to create user ${user.name}:`, error);
      }
    }

    console.log(`\n🎉 Seeding complete!`);
    console.log(`✅ Success: ${successCount} users`);
    console.log(`❌ Errors: ${errorCount} users`);

    return {
      success: successCount,
      errors: errorCount,
      total: usersToSeed.length,
    };
  },
});

export const clearTestUsers = internalAction({
  args: {},
  handler: async (ctx): Promise<{ deleted: number; total: number }> => {
    console.log("🗑️ Clearing all test users...");

    // Get all users with test email addresses
    const allUsers = await ctx.runQuery(internal.users.getAllUsersInternal);
    const testUsers = allUsers.filter(
      (user: any) =>
        user.email.endsWith("@test.meetonce.com") ||
        user.clerkId.startsWith("test_")
    );

    console.log(`Found ${testUsers.length} test users to delete`);

    let deleteCount = 0;

    for (const user of testUsers) {
      try {
        await ctx.runMutation(internal.users.deleteUser, { userId: user._id });
        deleteCount++;
        console.log(`✅ Deleted: ${user.name}`);
      } catch (error) {
        console.error(`❌ Failed to delete ${user.name}:`, error);
      }
    }

    console.log(`\n🎉 Cleanup complete! Deleted ${deleteCount} test users.`);

    return {
      deleted: deleteCount,
      total: testUsers.length,
    };
  },
});
