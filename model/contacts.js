const fs = require("fs/promises");
// const contacts = require("./contacts.json");
const path = require("path");

const contacts = path.join(__dirname, "contacts.json");

// const { v4: uuid } = require("uuid");

const listContacts = async () => {
  try {
    const data = await fs.readFile(contacts);
    const contactsList = JSON.parse(data);
    return contactsList;
  } catch (error) {
    return error.message;
  }
};

const getContactById = async (contactId) => {
  try {
    const data = await fs.readFile(contacts);
    const contactsList = JSON.parse(data);
    const foundContact = contactsList.find(
      ({ id }) => id.toString() === contactId
    );
    return foundContact;
  } catch (error) {
    return error.message;
  }
};

const removeContact = async (contactId) => {
  try {
    const data = await fs.readFile(contacts);
    const contactsList = JSON.parse(data);

    const foundContact = contactsList.find(
      ({ id }) => id.toString() === contactId
    );
    const filteredContacts = contactsList.filter(
      ({ id }) => id.toString() !== contactId
    );

    if (filteredContacts.length !== contactsList.length) {
      fs.writeFile(contacts, JSON.stringify(filteredContacts));
      return foundContact;
    } else {
      return `The contact with id ${contactId} is not found`;
    }
  } catch (error) {
    return error.message;
  }
};

const addContact = async (body) => {
  try {
    const data = await fs.readFile(contacts);
    const contactsList = JSON.parse(data);

    const { name, email, phone } = body;
    if (
      contactsList.find(
        (contact) =>
          name === contact.name ||
          email === contact.email ||
          phone === contact.phone
      )
    ) {
      return "This contact exists";
    }

    // const id = uuid();
    const lastContactIndex = contactsList.length - 1;
    const id = contactsList[lastContactIndex].id + 1;
    const newContact = { id, ...body };

    contactsList.push(newContact);

    fs.writeFile(contacts, JSON.stringify(contactsList));

    return newContact;
  } catch (error) {
    return error.message;
  }
};

const updateContact = async (contactId, body) => {
  try {
    const data = await fs.readFile(contacts);
    const contactsList = JSON.parse(data);

    const foundContact = contactsList.find(
      ({ id }) => id.toString() === contactId
    );

    const updatedContact = {
      ...foundContact,
      ...body,
    };

    const updatedContacts = contactsList.map((contact) => {
      if (contact.id !== updatedContact.id) {
        return contact;
      } else {
        return updatedContact;
      }
    });

    fs.writeFile(contacts, JSON.stringify(updatedContacts));

    return updatedContact;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
