import mongoose from 'mongoose'
import RepositoryBase from '../RepositoryBase.js'
import RestaurantMongoose from './models/RestaurantMongoose.js'
import OrderMongoose from './models/OrderMongoose.js'

class RestaurantRepository extends RepositoryBase {
  async findById (id, ...args) {
    try {
      const leanNeeded = args[0]?.lean
      if (leanNeeded) {
        return await RestaurantMongoose.findById(id).lean()
      }
      return await RestaurantMongoose.findById(id)
    } catch (err) {
      return null
    }
  }

  async findAll () {
    return RestaurantMongoose.find().populate('restaurantCategory')
  }

  async create (restaurantData) {
    return (new RestaurantMongoose(restaurantData)).save()
  }

  async update (id, restaurantData) {
    return RestaurantMongoose.findByIdAndUpdate(id, restaurantData, { new: true })
  }

  async destroy (id) {
    return (await RestaurantMongoose.findByIdAndDelete(id)) !== null
  }

  async save (entity) {
    return RestaurantMongoose.findByIdAndUpdate(entity.id, entity, { upsert: true, new: true })
  }

  async findByOwnerId (ownerId) {
    return RestaurantMongoose.find({ _userId: new mongoose.Types.ObjectId(ownerId) }).populate('restaurantCategory')
  }

  async show (id) {
    return RestaurantMongoose.findById(id).populate(['restaurantCategory', 'products.productCategory'])
  }

  async updateAverageServiceTime (restaurantId) {
    const restaurant = await RestaurantMongoose.findById(restaurantId)
    restaurant.averageServiceMinutes = await restaurant.getAverageServiceTime()
    return restaurant.save()
  }

  async searchRestaurants(postalCode, categoryId, expensive, sortBy) {
    try {
      let query = {}
      if (postalCode) {
        query.postalCode = postalCode
      }
      if (categoryId) {
        query._restaurantCategoryId = categoryId
      }
      if (expensive !== undefined) {
        const avgPrice = await RestaurantMongoose.aggregate([{ $group: { _id: null, avgPrice: { $avg: '$products.price' } } }])
        console.log('Average Price:', avgPrice)
        if (expensive === 'true') {
          query['products.price'] = { $gte: avgPrice[0].avgPrice }
        } else {
          query['products.price'] = { $lt: avgPrice[0].avgPrice }
        }
      }
      const restaurants = await RestaurantMongoose.find(query)
      if (sortBy === 'deliveryTime') {
        restaurants.sort((a, b) => a.deliveryTime - b.deliveryTime)
      } else if (sortBy === 'preparationTime') {
        restaurants.sort((a, b) => a.preparationTime - b.preparationTime)
      }
      return restaurants
    } catch (error) {
      throw error
    }
  }

  async topLastWeek() {
    const startOfLastWeek = new Date();
    startOfLastWeek.setDate(startOfLastWeek.getDate() - startOfLastWeek.getDay() - 6);

    const aggregationPipeline = [
      {
        $match: {
          startedAt: { $gte: startOfLastWeek }
        }
      },
      {
        $group: {
          _id: '$restaurantId',
          totalAmountLastWeek: { $sum: '$price' }
        }
      },
      {
        $lookup: {
          from: 'restaurants',
          localField: '_id',
          foreignField: '_restaurantId',
          as: 'restaurant'
        }
      },
      {
        $unwind: '$restaurant'
      },
      {
        $sort: { totalAmountLastWeek: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          id: '$restaurant._id',
          restaurant: 1,
          totalAmountLastWeek: 1
        }
      }
    ];

    const topRestaurantsLastWeek = await OrderMongoose.aggregate(aggregationPipeline)
    return topRestaurantsLastWeek
  }

  async topLastMonth() {
    const startOfLastMonth = new Date();
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    const aggregationPipeline = [
      {
        $match: {
          startedAt: { $gte: startOfLastMonth }
        }
      },
      {
        $group: {
          _id: '$restaurantId',
          totalAmountLastMonth: { $sum: '$price' }
        }
      },
      {
        $lookup: {
          from: 'restaurants',
          localField: '_id',
          foreignField: '_restaurantId',
          as: 'restaurant'
        }
      },
      {
        $unwind: '$restaurant'
      },
      {
        $sort: { totalAmountLastMonth: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          id: '$restaurant._id',
          restaurant: 1,
          totalAmountLastMonth: 1
        }
      }
    ]
    const topRestaurantsLastMonth = await OrderMongoose.aggregate(aggregationPipeline)
    return topRestaurantsLastMonth
  }

  async topLastYear() {
    const startOfLastYear = new Date();
    startOfLastYear.setFullYear(startOfLastYear.getFullYear() - 1);

    const aggregationPipeline = [
      {
        $match: {
          startedAt: { $gte: startOfLastYear }
        }
      },
      {
        $group: {
          _id: '$restaurantId',
          totalAmountLastYear: { $sum: '$price' }
        }
      },
      {
        $lookup: {
          from: 'restaurants',
          localField: '_id',
          foreignField: '_restaurantId',
          as: 'restaurant'
        }
      },
      {
        $unwind: '$restaurant'
      },
      {
        $sort: { totalAmountLastYear: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          id: '$restaurant._id',
          restaurant: 1,
          totalAmountLastYear: 1
        }
      }
    ]
    const topRestaurantsLastYear = await OrderMongoose.aggregate(aggregationPipeline)
    return topRestaurantsLastYear
  }

}

export default RestaurantRepository
