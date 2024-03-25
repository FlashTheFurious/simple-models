// pull in our models. This will automatically load the index.js from that folder
const models = require('../models');

// get the Cat model
const Cat = require('../models/Cat.js');
const Dog = require('../models/Dog.js');

// Function to handle rendering the index page.
const hostIndex = async (req, res) => {
  //Start with the name as unknown
  let name = 'unknown';

  try{
    const doc = await Cat.findOne({}, {}, { 
      sort: {'createdDate': 'descending'}
    }).lean().exec();

    //If we did get a cat back, store it's name in the name variable.
    if(doc) {
      name = doc.name;
    }
  } catch (err) {
    //Just log out the error for our records.
    //console.log(err);
  }

  /* res.render will render the given view from the views folder. In this case, index.
     We pass it a number of variables to populate the page.
  */
  res.render('index', {
    currentName: name,
    title: 'Home',
    pageName: 'Home Page',
  });
};

// Function for rendering the page1 template
// Page1 has a loop that iterates over an array of cats
const hostPage1 = async (req, res) => {
  try {
    const docs = await Cat.find({}).lean().exec();

    // Once we get back the docs array, we can send it to page1.
    return res.render('page1', { cats: docs });
  } catch (err) {
    //console.log(err);
    return res.status(500).json({ error: 'failed to find cats' });
  }
};

// Function to render the untemplated page2.
const hostPage2 = (req, res) => {
  res.render('page2');
};

// Function to render the untemplated page3.
const hostPage3 = (req, res) => {
  res.render('page3');
};

// Get name will return the name of the last added cat.
const getName = async (req, res) => {
  try{
    const doc = await Cat.findOne({}).sort({'createdDate': 'descending'}).lean().exec();

    //If we did get a cat back, store it's name in the name variable.
    if(doc) {
      return res.json({name: doc.name});
    }
    return res.status(404).json({error: 'No cat found'});
  } catch (err) {
    //console.log(err);
    return res.status(500).json({error: 'Something went wrong contacting the database'});
  }
}

// Function to create a new cat in the database
const setName = async (req, res) => {
  if (!req.body.firstname || !req.body.lastname || !req.body.beds) {
    // If they are missing data, send back an error.
    return res.status(400).json({ error: 'firstname, lastname and beds are all required' });
  }
  const catData = {
    name: `${req.body.firstname} ${req.body.lastname}`,
    bedsOwned: req.body.beds,
  };

  const newCat = new Cat(catData);

  try {
    
    await newCat.save();
    return res.status(201).json({
      name: newCat.name,
      beds: newCat.bedsOwned,
    });
  } catch (err) {
    //console.log(err);
    return res.status(500).json({ error: 'failed to create cat' });
  }
};

// Function to handle searching a cat by name.
const searchName = async (req, res) => {
  
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }

  
  let doc;
  try {
    
    doc = await Cat.findOne({ name: req.query.name }).exec();
  } catch (err) {
    // If there is an error, log it and send the user an error message.
    //console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }

  // If we do not find something that matches our search, doc will be empty.
  if (!doc) {
    return res.status(404).json({ error: 'No cats found' });
  }

  // Otherwise, we got a result and will send it back to the user.
  return res.json({ name: doc.name, beds: doc.bedsOwned });
};

const updateLast = (req, res) => {
  
  const updatePromise = Cat.findOneAndUpdate({}, {$inc: {'bedsOwned': 1}}, {
    returnDocument: 'after', //Populates doc in the .then() with the version after update
    sort: {'createdDate': 'descending'}
  }).lean().exec();

  // If we successfully save/update them in the database, send back the cat's info.
  updatePromise.then((doc) => res.json({
    name: doc.name,
    beds: doc.bedsOwned,
  }));

  // If something goes wrong saving to the database, log the error and send a message to the client.
  updatePromise.catch((err) => {
    //console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  });
};

// A function to send back the 404 page.
const notFound = (req, res) => {
  res.status(404).render('notFound', {
    page: req.url,
  });
};


// Function to create a new dog
const createDog = async (req, res) => {
    // Check for required fields
    if (!req.body.name || !req.body.breed || req.body.age === undefined) {
      return res.status(400).json({ error: 'Name, breed, and age are required.' });
    }
  
    const dogData = {
      name: req.body.name,
      breed: req.body.breed,
      age: req.body.age,
    };
  
    const newDog = new Dog(dogData);
  
    try {
      await newDog.save();
      return res.status(201).json({ message: 'Dog created successfully' });
    } catch (err) {
      //console.error(err);
      return res.status(500).json({ error: 'Failed to create dog' });
    }
  };
  
  // Function to increase a dog's age
  const increaseDogAge = async (req, res) => {
    if (!req.body.name) {
      return res.status(400).json({ error: 'Name is required to find a dog.' });
    }
  
    try {
      const dog = await Dog.findOne({ name: req.body.name });
  
      if (!dog) {
        return res.status(404).json({ error: 'Dog not found' });
      }
  
      dog.age += 1;
      await dog.save();
  
      return res.status(200).json({ message: 'Dog age increased successfully' });
    } catch (err) {
      //console.error(err);
      return res.status(500).json({ error: 'Failed to increase dog age' });
    }
  };
  
  // Function to list all dogs
  const listDogs = async (req, res) => {
    try {
      const dogs = await Dog.find({}).lean();
      return res.render('page4', { dogs });
    } catch (err) {
      //console.error(err);
      return res.status(500).json({ error: 'Failed to retrieve dogs' });
    }
  };

  // Page 4 was not loading so this function was to test out if DogModel was correctly imported

  /*
const fetchDogs = async () => {
  try {
    const allDogs = await Dog.find({});
    console.log(allDogs);
  } catch (error) {
    console.error("Error fetching dogs:", error);
  }
};

fetchDogs();
*/

// export the relevant public controller functions
module.exports = {
    index: hostIndex,
    page1: hostPage1,
    page2: hostPage2,
    page3: hostPage3,
    getName,
    setName,
    updateLast,
    searchName,
    notFound,
    createDog,
    increaseDogAge,
    listDogs,
  };