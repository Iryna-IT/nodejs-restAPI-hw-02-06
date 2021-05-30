const Contact = require('./schemas/contact');

const listContacts = async (userId, query) => {
  const {
    page = 1,
    limit = 5,
    skip = (page - 1) * limit,
    offset = 0,
    sortBy,
    sortByDesc,
    filter, // name|phone|favorite
    favorite = null,
  } = query;

  const optionsSearch = { owner: userId };
  if (favorite !== null) {
    optionsSearch.favorite = favorite;
  }

  const results = await Contact.paginate(optionsSearch, {
    page,
    limit,
    skip,
    offset,
    select: filter ? filter.split('|').join(' ') : '', // 'name phone favorite'
    sort: {
      ...(sortBy ? { [`${sortBy}`]: 1 } : {}),
      ...(sortByDesc ? { [`${sortByDesc}`]: -1 } : {}),
    },
    populate: {
      path: 'owner',
      select: 'email',
    },
  });
  const { docs: contacts, totalDocs: total } = results;
  return { contacts, total, limit, offset, skip, page };
};

const getContactById = async (userId, id) => {
  const result = await Contact.findOne({ _id: id, owner: userId }).populate({
    path: 'owner',
    select: 'email subscription -_id',
  });
  return result;
};

const removeContact = async (userId, id) => {
  const result = await Contact.findByIdAndRemove({ _id: id, owner: userId });
  return result;
};

const addContact = async body => {
  const result = await Contact.create(body);
  return result;
};

const updateContact = async (userId, id, body) => {
  const result = await Contact.findOneAndUpdate(
    {
      _id: id,
      owner: userId,
    },
    { ...body },
    { new: true },
  );
  return result;
};

const updateStatusContact = async (userId, id, body) => {
  const result = await Contact.findOneAndUpdate(
    {
      _id: id,
      owner: userId,
    },
    { ...body },
    { new: true },
  );
  return result;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
