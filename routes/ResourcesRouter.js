const express = require("express")
const Resource = require("../controllers/ResourcesController")
const passport = require("passport")
const router = express.Router()


//upload a resource
router.post('/create/:id' ,passport.authenticate('jwt', { session: false }),Resource.Resource_create_post)
//Get all resource for resource page
router.get('/faculty/:id', Resource.resource_list);
//get resource details
router.get('/resource-detail/:id' , Resource.Resource_detail)
//download a resource
router.get('/download/:id' , Resource.pdf_download)
//get a search
router.get('/cover/:id' , Resource.cover_download)

router.get('/search/:id' , Resource.search_resource)
//Delete resource
router.delete('/delete/:id' ,passport.authenticate('jwt', { session: false }),Resource.deleteResource )
module.exports = router;
