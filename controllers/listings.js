  const Listing = require("../models/listing");
  const axios = require('axios');

  
  module.exports.index = async (req , res) =>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs" , {allListings});
}



  module.exports.renderNewForm = (req , res) =>{
    res.render("listings/new.ejs");
}


module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
  .populate({path :"reviews" , populate : {path : "author",},
  })
  .populate("owner");
//   console.log("Listing image value:", listing.image);

  if(!listing) {
       req.flash("error" , "Listing you requested for does not exist!");
        return res.redirect("/listings");
  }
   console.log(listing);
  return res.render("listings/show.ejs", { listing });
}



// module.exports.createListing = async (req , res , next) =>{
//   let url = req.file.path;
//   let filename = req.file.filename;
//   // console.log(url , "..." , filename);
//    const newListing = new Listing(req.body.listing);
//    newListing.owner = req.user._id;
//    newListing.image = {url , filename};
//     await newListing.save();
//   req.flash("success" , "New Listing Created!!")
// // // console.log(newListing);
//    res.redirect("/listings");
   
// }






module.exports.createListing = async (req , res , next) => {
  let url = req.file.path;
  let filename = req.file.filename;

  // 🌍 Geocode using Nominatim
  const geoRes = await axios.get(
    `https://nominatim.openstreetmap.org/search`,
    {
      params: {
        q: req.body.listing.location,
        format: "json",
        limit: 1
      }
    }
  );

  let geoData = [0, 0];

  if (geoRes.data.length > 0) {
    geoData = [
      parseFloat(geoRes.data[0].lon),
      parseFloat(geoRes.data[0].lat)
    ];
  }

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = {url , filename};

  newListing.geometry = {
    type: "Point",
    coordinates: geoData
  };

  await newListing.save();

  req.flash("success" , "New Listing Created!!")
  return res.redirect("/listings");
};



             






module.exports.renderEditForm = async (req , res) =>{
 let {id} = req.params;
 const listing = await Listing.findById(id); 
 if(!listing) {
       req.flash("error" , "Listing you requested for does not exist!");
        return res.redirect("/listings");
  }

  let originalImageUrl  = listing.image.url;
   originalImageUrl = originalImageUrl.replace("/upload" , "/upload/h_300,w_250")
res.render("listings/edit.ejs" , {listing ,  originalImageUrl});
}



// module.exports.updateListing = async (req, res) => {
     
//     let { id } = req.params;
    
//     let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

//     if(typeof req.file !== "undefined") {
//      let url = req.file.path;
//      let filename = req.file.filename;

//      listing.image = {url , filename};
//      await listing.save();
//     }

//       req.flash("success" , "Listing updated!!")
//       res.redirect(`/listings/${id}`);
// }








module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
    
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  // Update image if uploaded
  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url , filename};
    await listing.save();
  }

  // 🌍 Update coordinates if location changed
  if (req.body.listing.location) {
    const geoRes = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          q: req.body.listing.location,
          format: "json",
          limit: 1
        }
      }
    );

    if (geoRes.data.length > 0) {
      listing.geometry = {
        type: "Point",
        coordinates: [
          parseFloat(geoRes.data[0].lon),
          parseFloat(geoRes.data[0].lat)
        ]
      };
      await listing.save();
    }
  }

  req.flash("success" , "Listing updated!!")
  res.redirect(`/listings/${id}`);
};







module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
      req.flash("success" , "Listing Deleted!!")

    res.redirect("/listings");
}