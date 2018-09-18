const Promise = require(`bluebird`)
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
} = require(`gatsby/graphql`)

const resolveFixed = (image, options) => {

  // Set default values, either we use real image dimensions or a thumbnail
  const width = options.width ? options.width : image.dimensions.width
  const height = options.width ? options.width : image.dimensions.height

  const availableWidths = [150, 240, 320, 480, 640, image.dimensions.width]
  if (!availableWidths.includes(width)) {
    console.warn(`Desired width not available, Available widths ${availableWidths.join(',')}`)
    return
  }

  if (!options.resizingBehavior) {
    options.resizingBehavior = `fill`
  }

  // Instagram already provides thumbnails so for the moment we only provide
  // these fixed widths along with the original photo.
  const fixedSizes = image.thumbnails.reduce((obj, item) => {
    obj[item.config_width] = {src: item.src, width: item.config_width, height: item.config_height}
    return obj
  }, {})
  fixedSizes[image.dimensions.width] = {src: image.original, ...image.dimensions}

  // Create the srcSet.
  const srcSet = Object.keys(fixedSizes)
    .map((width, i) => {
      let resolution
      switch (i) {
        case 0:
          resolution = `0.2x`
          break
        case 1:
          resolution = `0.35x`
          break
        case 2:
          resolution = `0.4x`
          break
        case 3:
          resolution = `0.6x`
          break
        case 4:
          resolution = `0.75x`
          break
        case 5:
          resolution = `1x`
          break
        default:
      }
      return `${fixedSizes[width].src} ${resolution}`
    }).join(`,\n`)

  return {
    aspectRatio: width / height,
    width: width,
    height: height,
    src: fixedSizes[width].src,
    srcSet,
  }
}
exports.resolveFixed = resolveFixed

const fixedNodeType = ({ name }) => {
  return {
    type: new GraphQLObjectType({
      name: name,
      fields: {
        aspectRatio: { type: GraphQLFloat },
        width: { type: GraphQLFloat },
        height: { type: GraphQLFloat },
        src: { type: GraphQLString },
        srcSet: { type: GraphQLString },
      },
    }),
    args: {
      width: {
        type: GraphQLInt,
      },
      quality: {
        type: GraphQLInt,
        defaultValue: 100,
      },
    },
    resolve: (image, options, context) =>
      Promise.resolve(resolveFixed(image, options)).then(node => {
        return {
          ...node,
          image,
          options,
          context,
        }
      }),
  }
}

exports.extendNodeType = ({ type, store }) => {
  if (type.name !== `InstaNode`) {
    return {}
  }

  return {
    fixed: fixedNodeType({ name: `InstagramFixed` }),
  }
}
