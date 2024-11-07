'use strict';
/*
  `node-fetch` have different export depending on CJS or ESM
  context - requiring CJS (regular build) will return a function directly,
  requiring ESM (what is currently being bundled for rendering engines
  which are used by DSG) will return object with `default` field which is
  a function. `preferDefault` helper will just use `.default` if available,
  but will fallback to entire export if not available
*/
const preferDefault = m => (m && m.default) || m;
const fetch = preferDefault(require('node-fetch'));

const { getCustomHeaders } = require('./utils');

const deleteContentstackNodes = (
  item,
  type,
  createNodeId,
  getNode,
  deleteNode,
  typePrefix
) => {
  let nodeId = '';
  let node = null;
  if (type === 'entry') {
    nodeId = createNodeId(
      `${typePrefix.toLowerCase()}-entry-${item.uid}-${item.locale}`
    );
  }
  if (type === 'asset') {
    nodeId = createNodeId(
      `${typePrefix.toLowerCase()}-assets-${item.uid}-${item.locale}`
    );
  }
  node = getNode(nodeId);
  if (node) {
    deleteNode(node);
  }
};

const validateContentstackAccess = async pluginOptions => {
  if (process.env.NODE_ENV === `test`) return undefined;

  let host = pluginOptions.cdn
    ? pluginOptions.cdn
    : 'https://cdn.contentstack.io/v3';

  const headers = {
    api_key: `${pluginOptions.api_key}`,
    access_token: `${pluginOptions.delivery_token}`,
    branch: pluginOptions?.branch,
    ...getCustomHeaders(
      pluginOptions?.enableEarlyAccessKey,
      pluginOptions?.enableEarlyAccessValue
    ),
  };

  const fetchContentTypes = fetch(`${host}/content_types?include_count=false`, {
    headers,
  });

  // const fetchTaxonomies = fetch(`${host}/taxonomies?include_count=false`, {
  //   headers,
  // });

  try {
    const [contentTypesResponse,
      // taxonomiesResponse
    ] = await Promise.all([
      fetchContentTypes,
      // fetchTaxonomies,
    ]);

    // console.log("\n--- Contentstack Access Validation ---");
    // console.log("\n--- Headers ---", headers);
    // console.log("\n--- Host ---", host);
    // console.log("\n--- Content Types URL ---", `${host}/content_types?include_count=false`);
    // console.log("\n--- Content Types fetched", contentTypesResponse);

    // console.log("\n--- Taxonomies fetched", taxonomiesResponse);
    

    if (!contentTypesResponse.ok) {
      throw new Error(
        `Cannot access Contentstack content types with api_key=${pluginOptions.api_key} & delivery_token=${pluginOptions.delivery_token}.`
      );
    }

    // if (!taxonomiesResponse.ok) {
    //   throw new Error(
    //     `Cannot access Contentstack taxonomies with api_key=${pluginOptions.api_key} & delivery_token=${pluginOptions.delivery_token}.`
    //   );
    // }
  } catch (error) {
    throw new Error(`Error validating Contentstack access: ${error.message}`);
  }

  return undefined;
};


exports.deleteContentstackNodes = deleteContentstackNodes;
exports.validateContentstackAccess = validateContentstackAccess;
