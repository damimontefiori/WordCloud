// Lista de nombres geek para asignar automáticamente a usuarios
export const geekNames = [
  // Marvel Heroes
  'Iron Man', 'Spider-Man', 'Captain America', 'Thor', 'Hulk', 'Black Widow', 'Hawkeye',
  'Doctor Strange', 'Scarlet Witch', 'Vision', 'Falcon', 'Winter Soldier', 'Ant-Man',
  'Wasp', 'Captain Marvel', 'Black Panther', 'Star-Lord', 'Gamora', 'Rocket', 'Groot',
  'Drax', 'Mantis', 'Nebula', 'Wolverine', 'Storm', 'Cyclops', 'Jean Grey', 'Beast',
  'Nightcrawler', 'Rogue', 'Iceman', 'Colossus', 'Kitty Pryde', 'Deadpool',
  
  // Marvel Villains
  'Thanos', 'Loki', 'Red Skull', 'Green Goblin', 'Doctor Doom', 'Magneto', 'Mystique',
  'Sabretooth', 'Juggernaut', 'Apocalypse', 'Venom', 'Carnage', 'Ultron', 'Kingpin',
  'Galactus', 'Silver Surfer', 'Dormammu', 'Hela', 'Vulture', 'Rhino', 'Electro',
  
  // DC Heroes
  'Superman', 'Batman', 'Wonder Woman', 'The Flash', 'Green Lantern', 'Aquaman',
  'Cyborg', 'Martian Manhunter', 'Green Arrow', 'Black Canary', 'Supergirl', 'Batgirl',
  'Robin', 'Nightwing', 'Red Robin', 'Starfire', 'Raven', 'Beast Boy', 'Terra',
  'Blue Beetle', 'Booster Gold', 'Zatanna', 'Constantine', 'Swamp Thing',
  
  // DC Villains
  'Joker', 'Lex Luthor', 'Harley Quinn', 'Penguin', 'Riddler', 'Two-Face', 'Scarecrow',
  'Poison Ivy', 'Catwoman', 'Bane', 'Ra\'s al Ghul', 'Darkseid', 'Doomsday', 'Brainiac',
  'General Zod', 'Bizarro', 'Parasite', 'Metallo', 'Sinestro', 'Black Adam',
  
  // Anime/Manga Characters
  'Goku', 'Vegeta', 'Naruto', 'Sasuke', 'Luffy', 'Zoro', 'Natsu', 'Ichigo', 'Light Yagami',
  'Lelouch', 'Edward Elric', 'Alphonse Elric', 'Saitama', 'Genos', 'Tanjiro', 'Nezuko',
  'Demon Slayer', 'All Might', 'Deku', 'Bakugo', 'Todoroki', 'Erza', 'Lucy', 'Natsu',
  
  // Gaming Characters
  'Mario', 'Luigi', 'Princess Peach', 'Bowser', 'Link', 'Zelda', 'Ganondorf', 'Samus',
  'Sonic', 'Tails', 'Knuckles', 'Master Chief', 'Cortana', 'Kratos', 'Lara Croft',
  'Nathan Drake', 'Aloy', 'Geralt', 'Ciri', 'Ezio', 'Altair', 'Cloud', 'Sephiroth',
  'Pikachu', 'Charizard', 'Mewtwo', 'Ash Ketchum', 'Ryu', 'Chun-Li', 'Ken', 'Akuma',
  
  // Star Wars
  'Luke Skywalker', 'Leia Organa', 'Han Solo', 'Chewbacca', 'Obi-Wan', 'Yoda', 'Anakin',
  'Padmé', 'Mace Windu', 'Qui-Gon', 'Darth Vader', 'Emperor Palpatine', 'Darth Maul',
  'Count Dooku', 'General Grievous', 'Boba Fett', 'Jango Fett', 'Rey', 'Finn', 'Poe',
  'Kylo Ren', 'BB-8', 'R2-D2', 'C-3PO',
  
  // Harry Potter
  'Harry Potter', 'Hermione', 'Ron Weasley', 'Dumbledore', 'Snape', 'Voldemort',
  'Sirius Black', 'Remus Lupin', 'Hagrid', 'McGonagall', 'Draco Malfoy', 'Ginny',
  'Neville', 'Luna Lovegood', 'Bellatrix', 'Dobby',
  
  // Lord of the Rings
  'Frodo', 'Sam', 'Merry', 'Pippin', 'Aragorn', 'Legolas', 'Gimli', 'Boromir',
  'Gandalf', 'Saruman', 'Sauron', 'Gollum', 'Arwen', 'Eowyn', 'Faramir', 'Elrond',
  
  // Sci-Fi Classics
  'Spock', 'Kirk', 'Data', 'Picard', 'Worf', 'Neo', 'Morpheus', 'Trinity', 'Agent Smith',
  'Terminator', 'Sarah Connor', 'Ripley', 'Predator', 'Alien', 'Wall-E', 'Eve',
  'Optimus Prime', 'Bumblebee', 'Megatron', 'Starscream'
];

// Función para obtener un nombre aleatorio
export const getRandomGeekName = () => {
  const randomIndex = Math.floor(Math.random() * geekNames.length);
  return geekNames[randomIndex];
};

// Función para obtener un nombre único (evita repetidos en la misma sesión)
export const getUniqueGeekName = (usedNames = []) => {
  const availableNames = geekNames.filter(name => !usedNames.includes(name));
  
  if (availableNames.length === 0) {
    // Si todos los nombres están usados, agregar un número aleatorio
    return `${getRandomGeekName()} ${Math.floor(Math.random() * 1000)}`;
  }
  
  const randomIndex = Math.floor(Math.random() * availableNames.length);
  return availableNames[randomIndex];
};
