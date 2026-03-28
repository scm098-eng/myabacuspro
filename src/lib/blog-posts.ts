export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  image: string;
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'benefits-of-abacus-training',
    title: 'The Hidden Benefits of Abacus Training for Children',
    excerpt: 'Beyond just math, abacus training develops concentration, visualization, and cognitive speed.',
    date: 'March 15, 2024',
    author: 'MyAbacusPro Team',
    category: 'Education',
    image: 'https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.firebasestorage.app/o/student_learning.webp?alt=media',
    content: `
      <p>Abacus training is more than just a method for learning how to calculate. It is a comprehensive mental development program that enhances a child's brain power.</p>
      
      <h3>1. Enhanced Visualization</h3>
      <p>The core of advanced abacus training is "Anzan," or mental visualization. Children learn to see the abacus in their mind's eye, which significantly boosts their spatial reasoning and creative visualization skills.</p>
      
      <h3>2. Improved Concentration</h3>
      <p>To solve complex problems at high speeds, students must maintain absolute focus. This discipline carries over into other subjects like science, languages, and music.</p>
      
      <h3>3. Boosted Confidence</h3>
      <p>There is nothing quite like the feeling of calculating faster than a calculator. This mastery provides children with immense self-confidence that translates into their overall personality.</p>
      
      <p>At My Abacus Pro, we focus on these foundational skills to turn every student into a "Human Calculator."</p>
    `
  },
  {
    slug: 'how-to-master-mental-arithmetic',
    title: 'How to Master Mental Arithmetic Faster',
    excerpt: 'Practical tips and daily drills to boost your calculation speed using the digital abacus.',
    date: 'March 20, 2024',
    author: 'Master Trainer',
    category: 'Tips & Tricks',
    image: 'https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.firebasestorage.app/o/abacus_hero.webp?alt=media',
    content: `
      <p>Speed in mental arithmetic doesn't come overnight—it comes through consistency and the right techniques. Here are three tips to accelerate your progress.</p>
      
      <h3>1. Master the Formulas</h3>
      <p>Don't just memorize Small Sister and Big Brother formulas; understand the logic behind them. Practice each formula individually until it becomes a reflex move.</p>
      
      <h3>2. Daily Consistency over Intensity</h3>
      <p>Practicing for 15 minutes every single day is far more effective than a 3-hour session once a week. Use our <strong>Daily Streak</strong> feature to stay motivated!</p>
      
      <h3>3. Use Visualization Early</h3>
      <p>Once you are comfortable with the physical beads, start trying to identify the values without touching the screen. Our "Beads Value" practice is designed specifically for this.</p>
    `
  }
];
