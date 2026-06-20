import { MonsterDef } from '../types';

// New sprite sheet: Gemini_Generated_Image_4qdbv24qdbv24qdb.png — 8 cols × 5 rows
// Sprite positions assigned by visual matching left-to-right, top-to-bottom.

const monsters2: MonsterDef[] = [
  // ── COMMON (IDs 40-59) ──────────────────────────────────────────────────────
  {
    id: 40, name: 'Clock Owl', rarity: 'common', element: 'Mystic', hp: 100, maxCopies: 3, fragmentValue: 15,
    skills: [
      { name: 'Time Peck', damage: 15, description: 'Pecks with time-imbued talons.' },
      { name: 'Hour Strike', damage: 0, description: 'Flip 3 coins — +10 each Heads. All 3: +35 bonus!',
        coinToss: { count: 3, damagePerHead: 10, allHeadsBonus: 35 } },
    ],
    spriteSheet: 2, spriteRow: 0, spriteCol: 3,
    description: 'An owl whose eyes hold clock faces. Time bends around it.',
  },
  {
    id: 41, name: 'Crystal Gorilla', rarity: 'common', element: 'Earth', hp: 120, maxCopies: 3, fragmentValue: 15,
    skills: [
      { name: 'Crystal Punch', damage: 18, description: 'Slams with gem-encrusted fists.' },
      { name: 'Gem Smash', damage: 32, description: 'Shatters crystals on impact.' },
    ],
    spriteSheet: 2, spriteRow: 0, spriteCol: 4,
    description: 'A purple gorilla covered in natural crystals. Hits like a boulder.',
  },
  {
    id: 42, name: 'Cactus Llama', rarity: 'common', element: 'Nature', hp: 105, maxCopies: 3, fragmentValue: 15,
    skills: [
      { name: 'Thorn Spit', damage: 12, description: 'Spits cactus needles.' },
      { name: 'Desert Charge', damage: 27, description: 'Charges with its spiky body.' },
    ],
    spriteSheet: 2, spriteRow: 0, spriteCol: 6,
    description: 'A llama born in the desert, its fur replaced by green cactus spines.',
  },
  {
    id: 43, name: 'Thunder Wolf', rarity: 'common', element: 'Electric', hp: 110, maxCopies: 3, fragmentValue: 15,
    skills: [
      { name: 'Spark Bite', damage: 16, description: 'Bites, releasing an electric shock.', isElectric: true },
      { name: 'Storm Fang', damage: 30, description: 'Strikes with fangs crackling with lightning.', isElectric: true },
    ],
    passive: { description: 'After taking damage, deals 5 damage back.', type: 'counter_attack', value: 5 },
    spriteSheet: 2, spriteRow: 0, spriteCol: 7,
    description: 'A white wolf that generates lightning from its fur.',
  },
  {
    id: 44, name: 'Mushroom Deer', rarity: 'common', element: 'Nature', hp: 95, maxCopies: 3, fragmentValue: 15,
    skills: [
      { name: 'Spore Kick', damage: 14, description: 'Kicks releasing spore clouds.' },
      { name: 'Forest Blessing', damage: 24, description: 'Channels the forest for a strong blow.' },
    ],
    spriteSheet: 2, spriteRow: 1, spriteCol: 0,
    description: 'A gentle deer with mushrooms growing from its antlers.',
  },
  {
    id: 45, name: 'Coral Turtle', rarity: 'common', element: 'Water', hp: 115, maxCopies: 3, fragmentValue: 15,
    skills: [
      { name: 'Bubble Crash', damage: 16, description: 'Crashes with a bubble-wrapped shell.' },
      { name: 'Coral Cannon', damage: 29, description: 'Fires coral shards from its back.' },
    ],
    spriteSheet: 2, spriteRow: 1, spriteCol: 3,
    description: 'A turtle with living coral growing on its shell.',
  },
  {
    id: 46, name: 'Tea Spirit', rarity: 'common', element: 'Mystic', hp: 90, maxCopies: 3, fragmentValue: 15,
    skills: [
      { name: 'Hot Splash', damage: 15, description: 'Splashes scalding hot tea.' },
      { name: 'Tea Burst', damage: 26, description: 'Erupts like a boiling kettle.' },
    ],
    spriteSheet: 2, spriteRow: 1, spriteCol: 4,
    description: 'A sentient teacup filled with enchanted brew that burns opponents.',
  },
  {
    id: 47, name: 'Bone Seahorse', rarity: 'common', element: 'Water', hp: 100, maxCopies: 3, fragmentValue: 15,
    skills: [
      { name: 'Aqua Needle', damage: 14, description: 'Fires water needles from its snout.' },
      { name: 'Ghost Wave', damage: 28, description: 'Sends a spectral wave through the water.' },
    ],
    spriteSheet: 2, spriteRow: 1, spriteCol: 5,
    description: 'A skeletal seahorse that drifts between the sea and the spirit world.',
  },
  {
    id: 48, name: 'Nine Tail Fox', rarity: 'common', element: 'Fire', hp: 105, maxCopies: 3, fragmentValue: 15,
    skills: [
      { name: 'Flame Tail', damage: 17, description: 'Whips with nine burning tails.' },
      { name: 'Foxfire Blast', damage: 32, description: 'Releases a burst of mystical fox fire.' },
    ],
    passive: { description: '15% chance to dodge incoming attacks.', type: 'dodge', value: 15 },
    spriteSheet: 2, spriteRow: 1, spriteCol: 6,
    description: 'A cunning orange fox with nine blazing tails. Hard to pin down.',
  },
  {
    id: 49, name: 'Stone Gargoyle', rarity: 'common', element: 'Earth', hp: 120, maxCopies: 3, fragmentValue: 15,
    skills: [
      { name: 'Rock Wing', damage: 15, description: 'Strikes with a stone wing.' },
      { name: 'Gargoyle Crash', damage: 34, description: 'Drops from the sky with crushing force.' },
    ],
    spriteSheet: 2, spriteRow: 1, spriteCol: 7,
    description: 'A winged stone statue that comes alive and guards ancient ruins.',
  },
  {
    id: 50, name: 'Lava Spider', rarity: 'common', element: 'Fire', hp: 110, maxCopies: 3, fragmentValue: 15,
    skills: [
      { name: 'Burning Bite', damage: 18, description: 'Bites with magma-hot fangs.' },
      { name: 'Magma Trap', damage: 33, description: 'Spins a web of molten lava.' },
    ],
    spriteSheet: 2, spriteRow: 2, spriteCol: 0,
    description: 'A spider that nests inside volcanic rock. Its silk is pure magma.',
  },
  {
    id: 51, name: 'Jelly Capybara', rarity: 'common', element: 'Water', hp: 95, maxCopies: 3, fragmentValue: 15,
    skills: [
      { name: 'Aqua Pulse', damage: 14, description: 'Pulses with aquatic energy.' },
      { name: 'Jelly Shock', damage: 25, description: 'Delivers a shocking jelly slap.' },
    ],
    spriteSheet: 2, spriteRow: 2, spriteCol: 1,
    description: 'A capybara surrounded by a gelatinous water bubble. Oddly relaxed.',
  },
  {
    id: 52, name: 'Leaf Ray', rarity: 'common', element: 'Nature', hp: 100, maxCopies: 3, fragmentValue: 15,
    skills: [
      { name: 'Leaf Cutter', damage: 15, description: 'Cuts with razor-sharp leaf edges.' },
      { name: 'Wind Glide', damage: 27, description: 'Glides on wind to deliver a powerful strike.' },
    ],
    spriteSheet: 2, spriteRow: 2, spriteCol: 2,
    description: 'A manta ray made of living leaves that glides on the wind.',
  },
  {
    id: 53, name: 'Jungle Monkey', rarity: 'common', element: 'Nature', hp: 105, maxCopies: 3, fragmentValue: 15,
    skills: [
      { name: 'Vine Slap', damage: 16, description: 'Slaps with a vine whip.' },
      { name: 'Wild Combo', damage: 30, description: 'Unleashes a rapid combo of strikes.' },
    ],
    spriteSheet: 2, spriteRow: 2, spriteCol: 3,
    description: 'A monkey adorned with jungle plants that channels wild energy.',
  },
  {
    id: 54, name: 'Clockwork Owl', rarity: 'common', element: 'Mystic', hp: 100, maxCopies: 3, fragmentValue: 15,
    skills: [
      { name: 'Gear Peck', damage: 14, description: 'Pecks with a gear-reinforced beak.' },
      { name: 'Temporal Storm', damage: 28, description: 'Releases a storm of time-shifted energy.' },
    ],
    spriteSheet: 2, spriteRow: 2, spriteCol: 4,
    description: 'A mechanical owl built from ancient gears that ticks with time magic.',
  },
  {
    id: 55, name: 'Frost Turtle', rarity: 'common', element: 'Ice', hp: 115, maxCopies: 3, fragmentValue: 15,
    skills: [
      { name: 'Ice Shell', damage: 16, description: 'Bashes with its frozen shell.' },
      { name: 'Glacier Roll', damage: 32, description: 'Rolls like a glacier crushing everything.' },
    ],
    spriteSheet: 2, spriteRow: 2, spriteCol: 5,
    description: 'A massive turtle whose shell is permanently encrusted with ice.',
  },
  {
    id: 56, name: 'Twin Snake', rarity: 'common', element: 'Nature', hp: 105, maxCopies: 3, fragmentValue: 15,
    skills: [
      { name: 'Venom Bite', damage: 17, description: 'Bites with twin venomous heads.' },
      { name: 'Dual Strike', damage: 29, description: 'Strikes twice from both heads.' },
    ],
    spriteSheet: 2, spriteRow: 2, spriteCol: 6,
    description: 'A two-headed serpent with conflicting minds but united venom.',
  },
  {
    id: 57, name: 'Star Dolphin', rarity: 'common', element: 'Water', hp: 95, maxCopies: 3, fragmentValue: 15,
    skills: [
      { name: 'Star Splash', damage: 14, description: 'Splashes with cosmic water.' },
      { name: 'Cosmic Wave', damage: 30, description: 'Launches a starlight-infused wave.' },
    ],
    spriteSheet: 2, spriteRow: 2, spriteCol: 7,
    description: 'A dolphin from cosmic seas, its body painted with constellations.',
  },
  {
    id: 58, name: 'Crow Raider', rarity: 'common', element: 'Dark', hp: 100, maxCopies: 3, fragmentValue: 15,
    skills: [
      { name: 'Shadow Peck', damage: 15, description: 'Pecks from the shadows.' },
      { name: 'Night Dive', damage: 28, description: 'Dives unseen and strikes hard.' },
    ],
    spriteSheet: 2, spriteRow: 3, spriteCol: 1,
    description: 'A large black crow that raids under cover of darkness.',
  },
  {
    id: 59, name: 'Mole Miner', rarity: 'common', element: 'Earth', hp: 120, maxCopies: 3, fragmentValue: 15,
    skills: [
      { name: 'Dig Strike', damage: 18, description: 'Strikes from underground.' },
      { name: 'Cave Collapse', damage: 34, description: 'Collapses a cave on the opponent.' },
    ],
    spriteSheet: 2, spriteRow: 3, spriteCol: 2,
    description: 'A stout mole that tunnels through rock and swings a pickaxe.',
  },

  // ── RARE (IDs 60-74) ────────────────────────────────────────────────────────
  {
    id: 60, name: 'Crystal Deer', rarity: 'rare', element: 'Light', hp: 150, maxCopies: 2, fragmentValue: 40,
    skills: [
      { name: 'Prism Shot', damage: 28, description: 'Fires a prism of pure light.' },
      { name: 'Aurora Beam', damage: 45, description: 'Launches a beam of aurora energy.' },
    ],
    spriteSheet: 2, spriteRow: 3, spriteCol: 0,
    description: 'A deer whose antlers and body are made of living crystal light.',
  },
  {
    id: 61, name: 'Moon Butterfly', rarity: 'rare', element: 'Light', hp: 140, maxCopies: 2, fragmentValue: 40,
    skills: [
      { name: 'Lunar Dust', damage: 24, description: 'Scatters moon dust that blinds.' },
      { name: 'Moonlight Blast', damage: 42, description: 'Fires a concentrated moonbeam.' },
    ],
    spriteSheet: 2, spriteRow: 3, spriteCol: 3,
    description: 'A butterfly whose wings shimmer with moonlight. It only appears at night.',
  },
  {
    id: 62, name: 'Crystal Bear', rarity: 'rare', element: 'Ice', hp: 170, maxCopies: 2, fragmentValue: 40,
    skills: [
      { name: 'Ice Punch', damage: 30, description: 'Punches with ice-coated fists.' },
      { name: 'Crystal Slam', damage: 50, description: 'Slams the ground creating ice shards.' },
    ],
    passive: { description: 'Recover 10 HP every 2 turns.', type: 'regen', value: 10, triggerCondition: 'every_2_turns' },
    spriteSheet: 2, spriteRow: 3, spriteCol: 4,
    description: 'A bear whose body has crystallized into ice. Slowly heals in cold.',
  },
  {
    id: 63, name: 'Axolotl Mage', rarity: 'rare', element: 'Water', hp: 145, maxCopies: 2, fragmentValue: 40,
    skills: [
      { name: 'Aqua Bolt', damage: 26, description: 'Fires a bolt of condensed water.' },
      { name: 'Mystic Flood', damage: 44, description: 'Floods the arena with mystic water.' },
    ],
    spriteSheet: 2, spriteRow: 3, spriteCol: 5,
    description: 'A pink axolotl mage with regenerative magic and water spells.',
  },
  {
    id: 64, name: 'Toy Soldier Mouse', rarity: 'rare', element: 'Steel', hp: 150, maxCopies: 2, fragmentValue: 40,
    skills: [
      { name: 'Saber Slash', damage: 25, description: 'Slashes with a tiny ceremonial saber.' },
      { name: 'Royal Assault', damage: 48, description: 'Launches a coordinated military assault.' },
    ],
    spriteSheet: 2, spriteRow: 3, spriteCol: 6,
    description: 'A mouse in a toy soldier uniform. Fights with surprising precision.',
  },
  {
    id: 65, name: 'Armored Turtle', rarity: 'rare', element: 'Earth', hp: 180, maxCopies: 2, fragmentValue: 40,
    skills: [
      { name: 'Shell Crash', damage: 28, description: 'Crashes with an armored shell.' },
      { name: 'Fortress Smash', damage: 55, description: 'Strikes like a fortress falling.' },
    ],
    spriteSheet: 2, spriteRow: 3, spriteCol: 7,
    description: 'A turtle with spiked steel plating bolted to its shell.',
  },
  {
    id: 66, name: 'Floral Panther', rarity: 'rare', element: 'Nature', hp: 155, maxCopies: 2, fragmentValue: 40,
    skills: [
      { name: 'Blossom Claw', damage: 27, description: 'Slashes and leaves floral poison.' },
      { name: 'Floral Ambush', damage: 49, description: 'Ambushes from hiding in flowers.' },
    ],
    spriteSheet: 2, spriteRow: 4, spriteCol: 1,
    description: 'A sleek black panther whose fur blooms with enchanted flowers.',
  },
  {
    id: 67, name: 'Magma Turtle', rarity: 'rare', element: 'Fire', hp: 175, maxCopies: 2, fragmentValue: 40,
    skills: [
      { name: 'Lava Slam', damage: 29, description: 'Slams with a molten shell.' },
      { name: 'Volcanic Burst', damage: 54, description: 'Erupts like a miniature volcano.' },
    ],
    spriteSheet: 2, spriteRow: 4, spriteCol: 2,
    description: 'A turtle that feeds on volcanic heat. Its shell is always on fire.',
  },
  {
    id: 68, name: 'Snowman Guardian', rarity: 'rare', element: 'Ice', hp: 165, maxCopies: 2, fragmentValue: 40,
    skills: [
      { name: 'Snow Punch', damage: 25, description: 'Punches with a compacted snow fist.' },
      { name: 'Blizzard Smash', damage: 50, description: 'Smashes while summoning a blizzard.' },
    ],
    spriteSheet: 2, spriteRow: 4, spriteCol: 3,
    description: 'A snowman brought to life to guard a frozen fortress.',
  },
  {
    id: 69, name: 'Shadow Bat', rarity: 'rare', element: 'Dark', hp: 140, maxCopies: 2, fragmentValue: 40,
    skills: [
      { name: 'Sonic Bite', damage: 24, description: 'Bites with sonic wave amplification.' },
      { name: 'Dark Echo', damage: 46, description: 'Releases a dark sonic blast.' },
    ],
    spriteSheet: 2, spriteRow: 4, spriteCol: 4,
    description: 'A bat that travels via shadow portals, using sonic waves as weapons.',
  },
  {
    id: 70, name: 'Celestial Moth', rarity: 'rare', element: 'Light', hp: 145, maxCopies: 2, fragmentValue: 40,
    skills: [
      { name: 'Moon Dust', damage: 25, description: 'Releases blinding celestial dust.' },
      { name: 'Star Flare', damage: 48, description: 'Channels starlight into a flare.' },
    ],
    spriteSheet: 2, spriteRow: 0, spriteCol: 5,
    description: 'A divine moth whose wings glow with the light of distant stars.',
  },
  {
    id: 71, name: 'Samurai Frog', rarity: 'rare', element: 'Water', hp: 160, maxCopies: 2, fragmentValue: 40,
    skills: [
      { name: 'Water Slash', damage: 30, description: 'Slashes with a water-infused katana.' },
      { name: 'Honor Coin', damage: 0, description: 'Flip 1 coin — Heads: 50 damage, Tails: 20 damage.',
        coinToss: { count: 1, damagePerHead: 50, allHeadsBonus: 0, tailsDamage: 20 } },
    ],
    passive: { description: '20% chance to counter-attack for 15 damage when hit.', type: 'counter_attack', value: 15 },
    spriteSheet: 2, spriteRow: 0, spriteCol: 2,
    description: 'A frog who mastered the ancient art of katana warfare.',
  },
  {
    id: 72, name: 'Lantern Fish', rarity: 'rare', element: 'Water', hp: 150, maxCopies: 2, fragmentValue: 40,
    skills: [
      { name: 'Glow Bite', damage: 26, description: 'Bites with bioluminescent fangs.' },
      { name: 'Lucky Abyss', damage: 0, description: 'Flip 2 coins — +20 damage per Heads.',
        coinToss: { count: 2, damagePerHead: 20, allHeadsBonus: 0 } },
    ],
    spriteSheet: 2, spriteRow: 0, spriteCol: 1,
    description: 'A deep-sea lanternfish whose light lures prey from the darkness.',
  },
  {
    id: 73, name: 'Scarlet Hawk', rarity: 'rare', element: 'Wind', hp: 145, maxCopies: 2, fragmentValue: 40,
    skills: [
      { name: 'Wing Slash', damage: 28, description: 'Slashes with scarlet-feathered wings.' },
      { name: 'Sky Barrage', damage: 50, description: 'Unleashes a barrage from the sky.' },
    ],
    spriteSheet: 2, spriteRow: 0, spriteCol: 0,
    description: 'A mechanical hawk built for speed and precision aerial strikes.',
  },
  {
    id: 74, name: 'Coral Dragon', rarity: 'rare', element: 'Water', hp: 175, maxCopies: 2, fragmentValue: 40,
    skills: [
      { name: 'Reef Strike', damage: 30, description: 'Strikes with coral-encrusted claws.' },
      { name: 'Ocean Fury', damage: 55, description: 'Channels ocean fury into a massive wave.' },
    ],
    spriteSheet: 2, spriteRow: 4, spriteCol: 6,
    description: 'A sea dragon that grows coral colonies across its body.',
  },

  // ── LEGENDARY (IDs 75-77) ────────────────────────────────────────────────────
  {
    id: 75, name: 'Chronos Owl', rarity: 'legendary', element: 'Mystic', hp: 230, maxCopies: 1, fragmentValue: 120,
    skills: [
      { name: 'Time Beam', damage: 55, description: 'Fires a beam that ages the enemy.' },
      { name: 'Temporal Fate', damage: 0, description: 'Flip 4 coins — +15 each Heads. All 4: +60 bonus!',
        coinToss: { count: 4, damagePerHead: 15, allHeadsBonus: 60 } },
    ],
    passive: { description: '10% chance to gain an extra turn after attacking.', type: 'extra_turn', value: 10 },
    spriteSheet: 2, spriteRow: 1, spriteCol: 2,
    description: 'The mythic owl who controls the flow of time itself.',
  },
  {
    id: 76, name: 'Crystal Titan', rarity: 'legendary', element: 'Earth', hp: 250, maxCopies: 1, fragmentValue: 120,
    skills: [
      { name: 'Gem Quake', damage: 58, description: 'Triggers a gemstone earthquake.' },
      { name: 'Titan Crush', damage: 88, description: 'Crushes with the weight of a mountain.' },
    ],
    spriteSheet: 2, spriteRow: 1, spriteCol: 1,
    description: 'An ancient titan formed from crystallized earth, older than memory.',
  },
  {
    id: 77, name: 'Thunder Tempest Wolf', rarity: 'legendary', element: 'Electric', hp: 240, maxCopies: 1, fragmentValue: 120,
    skills: [
      { name: 'Thunder Fang', damage: 52, description: 'Bites with a thunderclap.', isElectric: true },
      { name: 'Tempest Wrath', damage: 90, description: 'Calls down a full tempest strike.', isElectric: true },
    ],
    passive: { description: 'When HP drops below 50%, damage increases by 20%.', type: 'storm_rage', value: 20 },
    spriteSheet: 2, spriteRow: 4, spriteCol: 0,
    description: 'A legendary wolf that embodies the spirit of the most violent storms.',
  },

  // ── MYTHIC (IDs 78-79) ───────────────────────────────────────────────────────
  {
    id: 78, name: 'Leviastar Dolphin', rarity: 'mythical', element: 'Cosmic', hp: 320, maxCopies: 1, fragmentValue: 300,
    skills: [
      { name: 'Cosmic Splash', damage: 82, description: 'Splashes with cosmic tidal force.' },
      { name: 'Galactic Tsunami', damage: 120, description: 'Unleashes a galaxy-scale tsunami.' },
    ],
    passive: { description: 'Heal 20 HP at the start of every turn.', type: 'ocean_blessing', value: 20, triggerCondition: 'every_turn' },
    spriteSheet: 2, spriteRow: 4, spriteCol: 7,
    description: 'A cosmic leviathan-dolphin that swims through starfields.',
  },
  {
    id: 79, name: 'Eclipse Kitsune', rarity: 'mythical', element: 'Dark', hp: 340, maxCopies: 1, fragmentValue: 300,
    skills: [
      { name: 'Eclipse Flame', damage: 85, description: 'Burns with the darkness of an eclipse.' },
      { name: 'Eclipse Destiny', damage: 0, description: 'Flip 1 coin — Heads: 150 damage, Tails: 50 damage.',
        coinToss: { count: 1, damagePerHead: 150, allHeadsBonus: 0, tailsDamage: 50 } },
    ],
    passive: { description: 'All skills deal +15 bonus damage.', type: 'eclipse_aura', value: 15 },
    spriteSheet: 2, spriteRow: 4, spriteCol: 5,
    description: 'A kitsune born from the convergence of a solar and lunar eclipse.',
  },
];

export default monsters2;
