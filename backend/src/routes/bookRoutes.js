import expres from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = expres.Router();

router.post("/", protectRoute, async (req, res) => {
    try {
        const {title, caption, image, rating} = req.body;

        if(!image || !title || !caption || !rating ) return res.status(400).send("All fields are required");

        //upload image to cloudinary
        const uploadResponseawait = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponseawait.secure_url;    

        //save to the database
        const newBook = await Book.create({
            title,
            caption,
            image: imageUrl,
            rating,
            user: req.user._id
        });

        await newBook.save();
        res.status(201).json(newBook);

    } catch (error) {
        console.log("Error creating book", error);
        res.status(500).json({error: error.message});
    }
});

router.get("/", protectRoute, async (req, res) => {
    try {

        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;
        
        const books = await Book.find()
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limit)
        .populate("user", "username profileImage");

        const totalBooks = await Book.countDocuments();

        res.send({
            books, 
            currentPage: page,
            totalPages: Math.ceil(books.length / limit),
            totalBooks
        });

    } catch (error) {
        console.log("Error getting books", error);
        res.status(500).json({message: "Internal server error"});
    }
});

router.get("/user", protectRoute, async (req, res) => {
    try {
        const books = await Book.find({user: req.user._id}).sort({createdAt: -1});
        res.json(books);
    } catch (error) {
        console.log("Error getting books", error);
        res.status(500).json({message: "Internal server error"});
    }
})

router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if(!book) return res.status(404).json({message: "Book not found"});   

        //check if the user is the owner of the book
        if(book.user.toString() !== req.user._id.toString()) return res.status(401).json({message: "You are not authorized to delete this book"});

        //delete image from cloudinary
        if(book.image && book.image.includes("cloudinary"))
        {
            try {

                const publicId = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);

            } catch (deleteError) {
                console.log("Error deleting image from cloudinary", deleteError);
            }
        }


        await book.deleteOne();
        res.json({message: "Book deleted successfully"});


    } catch (error) {
        console.log("Error deleting book", error);
        res.status(500).json({message: "Internal server error"});
    }  

});

export default router;