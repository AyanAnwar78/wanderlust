const Listing = require("../models/listing");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// INDEX
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

// NEW FORM
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// SHOW LISTING
module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

// CREATE LISTING

async function geocodeLocation(location) {
    if (!location) return { lat: 28.6139, lng: 77.2090 }; // fallback New Delhi
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
        const response = await fetch(url, { headers: { "User-Agent": "MajorProject/1.0" } });
        const data = await response.json();
        if (data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }
    } catch (err) {
        console.error("Geocoding error:", err);
    }
    return { lat: 28.6139, lng: 77.2090 }; // fallback
}


module.exports.createListing = async (req, res) => {
    const { location, country } = req.body.listing;
    const geoLocation = await geocodeLocation(location || country);

    const listing = new Listing(req.body.listing);
    listing.owner = req.user._id;
    listing.geometry = {
        type: 'Point',
        coordinates: [geoLocation.lng, geoLocation.lat]
    };

    if (req.file) {
        listing.image = { url: req.file.path, filename: req.file.filename };
    }

    await listing.save();
    req.flash("success", "Listing Created!");
    res.redirect(`/listings/${listing._id}`);
};

// EDIT FORM
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/listings");
  }
  res.render("listings/edit.ejs", { listing });
};

// UPDATE LISTING
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const { location, country } = req.body.listing;

    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    const geoLocation = await geocodeLocation(location || country);
    listing.geometry = { type: 'Point', coordinates: [geoLocation.lng, geoLocation.lat] };

    if (req.file) listing.image = { url: req.file.path, filename: req.file.filename };

    await listing.save();
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

// DELETE LISTING
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted");
  res.redirect("/listings");
};
