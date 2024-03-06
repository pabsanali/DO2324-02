import container from '../config/container.js'

class RestaurantController {
  constructor () {
    this.restaurantService = container.resolve('restaurantService')
    this.index = this.index.bind(this)
    this.indexOwner = this.indexOwner.bind(this)
    this.create = this.create.bind(this)
    this.show = this.show.bind(this)
    this.update = this.update.bind(this)
    this.destroy = this.destroy.bind(this)
    this.top = this.top.bind(this)
    this.searchRestaurants = this.searchRestaurants.bind(this)
  }

  async index (req, res) {
    try {
      const restaurants = await this.restaurantService.index()
      res.json(restaurants)
    } catch (err) {
      res.status(500).send(err.message)
    }
  }

  async indexOwner (req, res) {
    try {
      const restaurants = await this.restaurantService.indexOwner(req.user.id)
      res.json(restaurants)
    } catch (err) {
      res.status(500).send(err.message)
    }
  }

  async create (req, res) {
    const newRestaurantData = req.body
    newRestaurantData.userId = req.user.id
    try {
      const restaurant = await this.restaurantService.create(newRestaurantData)
      res.json(restaurant)
    } catch (err) {
      res.status(500).send(err.message)
    }
  }

  async show (req, res) {
    try {
      const restaurant = await this.restaurantService.show(req.params.restaurantId)
      res.json(restaurant)
    } catch (err) {
      res.status(500).send(err.message)
    }
  }

  async update (req, res) {
    const updatedRestaurantData = req.body
    updatedRestaurantData.userId = req.user.id
    try {
      const updatedRestaurant = await this.restaurantService.update(req.params.restaurantId, updatedRestaurantData)
      res.json(updatedRestaurant)
    } catch (err) {
      res.status(500).send(err.message)
    }
  }

  async destroy (req, res) {
    try {
      const result = await this.restaurantService.destroy(req.params.restaurantId)
      const message = result ? 'Successfully deleted.' : 'Could not delete restaurant.'
      res.json(message)
    } catch (err) {
      res.status(500).send(err.message)
    }
  }

  async top(req, res) {
    try {
      const top = await this.restaurantService.top();
      res.status(200).json(top);
    } catch (error) {
      console.error('Error searching restaurants:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  async searchRestaurants(req, res) {
    try {
      const { postalCode, categoryId, expensive, sortBy } = req.query;
      const restaurants = await this.restaurantService.searchRestaurants(postalCode, categoryId, expensive, sortBy);
      res.status(200).json(restaurants);
    } catch (error) {
      console.error('Error searching restaurants:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default RestaurantController
