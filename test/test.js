var expect = require('chai').expect;
var app = require('./fixtures/simple-app/server/server');
const { Customer, Order, OrderItem, Product } = app.models;

describe("mixin:FilterByRelations", function () {

    before(async function () {
        await Customer.create({ name: 'John' });
        await Customer.create({ name: 'Bob' });

        await Product.create({ name: 'milk' });
        await Product.create({ name: 'eggs' });

        await Order.create({ name: 'John: milk+eggs', customerId: 1 });
        await Order.create({ name: 'Bob: milk', customerId: 2 });
        await Order.create({ name: 'Bob: none', customerId: 2 });

        await OrderItem.create({ orderId: 1, productId: 1 });
        await OrderItem.create({ orderId: 1, productId: 2 });
        await OrderItem.create({ orderId: 2, productId: 2 });
    });


    describe('belongsTo', () => {
        it("should find 2 orders where customer.name = 'Bob'", async function () {
            let result = await app.models.Order.find({
                where: {
                    customer: {
                        name: "Bob"
                    }
                }
            });
            expect(result).to.be.an('array').that.have.lengthOf(2);
            expect(result[0].name).to.equal('Bob: milk');
            expect(result[1].name).to.equal('Bob: none');
        });

        it("should find 1 orders where customer.name = 'Bob' and name like 'none' (combined where)", async function () {
            let result = await app.models.Order.find({
                where: {
                    name: { like: "none" },
                    customer: {
                        name: "Bob"
                    }
                }
            });
            expect(result).to.be.an('array').that.have.lengthOf(1);
            expect(result[0].name).to.equal('Bob: none');
        });

        it("should find 1 orders where customer.name = 'Bob' and name like 'none' (use 'and' operator)", async function () {
            let result = await app.models.Order.find({
                where: {
                    and: [
                        { name: { like: "none" } },
                        {
                            customer: {
                                name: "Bob"
                            }
                        }
                    ]
                }
            });
            expect(result).to.be.an('array').that.have.lengthOf(1);
            expect(result[0].name).to.equal('Bob: none');
        });
    });

    describe('hasMany', () => {
        it("should find 2 customers where order.name like 'milk'", async function () {
            let result = await app.models.Customer.find({
                where: {
                    orders: {
                        name: { like: 'milk' }
                    }
                }
            })
            expect(result).to.be.an('array').that.have.lengthOf(2);
            expect(result[0].name).to.equal('John');
            expect(result[1].name).to.equal('Bob');
        });
    });

    describe('hasManyThrough', () => {
        it("should find 2 orders where product.name = 'milk", async function () {
            let result = await app.models.Order.find({
                where: {
                    products: { name: "milk" }
                }
            });
            expect(result).to.be.an('array').that.have.lengthOf(2);
            expect(result[0].name).to.equal('John: milk+eggs');
            expect(result[1].name).to.equal('Bob: milk');
        });
    });


    describe("nested relations", function () {
        it("should find 1 customer which have orders where product.name = 'milk'", async function () {
            var result = await app.models.Customer.find({
                where: {
                    orders: {
                        products: { name: "eggs" }
                    }
                }
            });
            expect(result).to.be.an('array').that.have.lengthOf(1);
            expect(result[0].name).to.equal('Bob');
        });
    });

    describe("and condition", function () {
        it("should find 1 customer which have orders where product.name = 'milk'", async function () {
            var result = await app.models.Customer.find({
                where: {
                    orders: {
                        products: { name: "eggs" }
                    }
                }
            });
            expect(result).to.be.an('array').that.have.lengthOf(1);
            expect(result[0].name).to.equal('Bob');
        });
    });

})