 const Review = require("../models/review.js");
const Listing = require("../models/listing.js");


module.exports.createReview = async (req , res) =>{
        let listing = await Listing.findById(req.params.id);
        let newReview = new Review(req.body.review);
          newReview.author = req.user._id;
          console.log(newReview);
        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();


          req.flash("success" , "New Review Created!!")

        
        return res.redirect(`/listings/${listing._id}`);
       }






       module.exports.destroyReview = async (req , res) =>{
                let { id , reviewId}  = req.params;
                 
                await Listing.findByIdAndUpdate(id , {$pull : {reviews : reviewId}});
                await Review.findById(reviewId);
                  req.flash("success" , "Listing Deleted!!");

                return res.redirect(`/listings/${id}`);
            }


 
// module.exports.createReview = async (req, res, next) => {
//     try {
//         const listing = await Listing.findById(req.params.id);
//         if (!listing) {
//             req.flash("error", "Listing not found");
//             return res.redirect("/listings"); // return important
//         }

//         const newReview = new Review(req.body.review);
//         newReview.author = req.user._id;

//         listing.reviews.push(newReview);

//         await newReview.save();
//         await listing.save();

//         req.flash("success", "New Review Created!!");
//         return res.redirect(`/listings/${listing._id}`);
//     } catch (err) {
//         return next(err); // pass error to global handler
//     }
// };

// module.exports.destroyReview = async (req, res, next) => {
//     try {
//         const { id, reviewId } = req.params;

//         await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
//         await Review.findByIdAndDelete(reviewId);

//         req.flash("success", "Review Deleted!!");
//         return res.redirect(`/listings/${id}`);
//     } catch (err) {
//         return next(err); // pass error to global handler
//     }
// };
