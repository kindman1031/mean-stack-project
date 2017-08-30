'use strict';
(function () {
  /**
   * @ngdoc service
   * @name app.faked
   * @description
   * # faked
   * Factory in the app.
   */
  angular.module('app').factory('faked',
    function($q, user) {
      var userRoles = routingConfig.userRoles;

      var users = [
        {
          username: 'admin@armoire.com',
          password: 'pass',
          role: userRoles.admin
        },
        {
          username: 'customer@armoire.com',
          password: 'pass',
          role: userRoles.user
        },
        {
          username: 'customer2@armoire.com',
          password: 'pass',
          role: userRoles.user
        },
        {
          username: 'customer3@armoire.com',
          password: 'pass',
          role: userRoles.user
        }
      ];

      _.each(users, function (u, key) {
        u.id = key;
        u.firstName = faker.name.firstName();
        u.lastName = faker.name.lastName();
        u.aCity = "Chicago";
        u.aCountry = 'United States';
        u.aState = 'Illinois';
        u.phone = faker.phone.phoneNumber();
        u.avatar = faker.internet.avatar();
        u.email = faker.internet.email();
        u.createdAt = faker.date.past();
        u.lastLogin = faker.date.recent();

        switch (key) {
          case 0:
          {
            u.aStreet = "900 N Michigan Ave";
            u.aStreetSecondary = null;
            u.aZip = "60611";
            break;
          }

          case 1:
          {
            u.aStreet = "2043 W Addison St";
            u.aStreetSecondary = "#2";
            u.aZip = "60618";
            break;
          }

          case 2:
          {
            user.aStreet = "3128 N Broadway St";
            user.aStreetSecondary = null;
            user.aZip = "60657";
            break;
          }

          case 3:
          {
            u.aStreet = "3458 N Halsted St";
            u.aStreetSecondary = null;
            u.aZip = "60657";
            break;
          }

          default:
          {
            u.aStreet = faker.address.streetAddress();
            u.aStreetSecondary = faker.address.secondaryAddress();
            u.aZip = faker.address.zipCode();
            break;
          }
        }
        u = new user(u);
      });
      users = hashArrayByID(users);
      //console.log(users);


      var itemTypes = [
        {
          name: 'Dresses',
        },
        {
          name: 'Sweaters',
        },
        {
          name: 'Shirts/Polos',
        },
        {
          name: 'Jackets/Blazers',
        },
        {
          name: 'Skirts',
        },
        {
          name: 'Suits',
        },
        {
          name: 'Accessories',
        }
      ];
      _.each(itemTypes, function (item, index) {
        item.id = index + 1;
      });
      itemTypes = hashArrayByID(itemTypes);

      var items = [];
      for (var i = 1; i < 50; i++) {
        var item = {};
        item.name = faker.lorem.sentence(2);
        item.photo = faker.image.fashion();
        item.type = _.sample(itemTypes, 1)[0].id;
        item.userId = _.sample(users, 1)[0].id;
        items.push(item);
      }

      var deliveries = [];
      for (var i = 1; i < 12; i++) {
        var delivery = {
          id: i,
          enabled: true,
          userId: _.sample(users, 1)[0].id,
          createAt: faker.date.future(),
          deliverAt: faker.date.future(),
          current: false,
          delivered: false,
          deliveredAt: undefined
        };
        deliveries.push(delivery);
      }
      _.each(deliveries, function (d) {
        d.delivered = faker.helpers.randomNumber() == 0;
        if (d.completed) {
          d.deliveredAt = faker.date.future();
        }
        d.createdDate = moment(d.createdAt);
        d.deliveryDate = moment(d.deliverAt);
        d.deliveredDate = moment(d.deliveredAt);
      });

      // Set the first one as the current delivery
      deliveries[0].current = true;
      deliveries[0].current = false;

      deliveries = hashArrayByID(deliveries);

      return {
        users: users,
        deliveries: deliveries,
        items: items,
        itemTypes: itemTypes
      };
    }
  );
})();
