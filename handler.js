// exports.hello = async (event) => {
//   return {
//     statusCode: 200,
//     body: JSON.stringify({
//       message: "Go Serverless v4! Your function executed successfully!",
//     }),
//   };
// };

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports.createItem = async (event) => {
  try {
    const data = JSON.parse(event.body);
    
    if (!data.name || !data.description) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    const newItem = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      createdAt: new Date().toISOString(),
    };

    await dynamoDB
      .put({
        TableName: "ItemsTable",
        Item: newItem,
      })
      .promise();

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Item created", item: newItem }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server error", error }),
    };
  }
};


module.exports.getItem = async (event) => {
  try {
    const { id } = event.pathParameters;

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing item ID" }),
      };
    }

    const result = await dynamoDB
      .get({
        TableName: "ItemsTable",
        Key: { id },
      })
      .promise();

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Item not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server error", error }),
    };
  }
};

module.exports.updateItem = async (event) => {
  try {
    const { id } = event.pathParameters;
    const body = JSON.parse(event.body);

    if (!id || !body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing ID or update data" }),
      };
    }

    const params = {
      TableName: "ItemsTable",
      Key: { id },
      UpdateExpression: "set #name = :name, #price = :price",
      ExpressionAttributeNames: {
        "#name": "name",
        "#price": "price",
      },
      ExpressionAttributeValues: {
        ":name": body.name,
        ":price": body.price,
      },
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamoDB.update(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Item updated", updatedItem: result.Attributes }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server error", error }),
    };
  }
};

module.exports.deleteItem = async (event) => {
  try {
    const { id } = event.pathParameters;

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing item ID" }),
      };
    }

    const params = {
      TableName: "ItemsTable",
      Key: { id },
    };

    await dynamoDB.delete(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Item deleted successfully" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server error", error }),
    };
  }
};