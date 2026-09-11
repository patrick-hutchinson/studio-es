export const mediaAssetFragment = `{
  "medium": {
    _index,
    "type": select(_type == "imageAsset" => "image", _type == "videoAsset" => "video"),

    "_id": select(
      _type == "imageAsset" => file.asset->_id,
      _type == "videoAsset" => file.asset->assetId,
      true => null
    ),

    "url": select(_type == "imageAsset" => file.asset->url, true => null),
    "lqip": select(_type == "imageAsset" => file.asset->metadata.lqip, true => null),
    "width": select(_type == "imageAsset" => file.asset->metadata.dimensions.width, true => null),
    "height": select(_type == "imageAsset" => file.asset->metadata.dimensions.height, true => null),
    "altText": select(_type == "imageAsset" => altText, true => null),


    "status": select(_type == "videoAsset" => file.asset->status, true => null),
    "assetId": select(_type == "videoAsset" => file.asset->assetId, true => null),
    "playbackId": select(_type == "videoAsset" => file.asset->playbackId, true => null),
    "duration": select(_type == "videoAsset" => file.asset->data.duration, true => null),
    "vimeoUrl": select(_type == "videoAsset" => vimeoUrl, true => null),
    "aspect_ratio": select(_type == "videoAsset" => file.asset->data.aspect_ratio,
      true => null
    ),
    "staticRenditions": select(
      _type == "videoAsset" => coalesce(file.asset->static_renditions, file.asset->data.static_renditions),
      true => null
    ),


    "copyright": select(
      _type == "imageAsset" => copyright,
      _type == "videoAsset" => copyright,
      true => null
    ),
  }
}`;

export const rasterGalleryAssetFragment = `{
  "expandable": coalesce(expandable, true),
  "medium": {
    "type": select(
      _type == "rasterGalleryItem" && media[0]._type == "imageAsset" => "image",
      _type == "rasterGalleryItem" && media[0]._type == "videoAsset" => "video",
      _type == "imageAsset" => "image",
      _type == "videoAsset" => "video",
      true => null
    ),
    "_id": coalesce(media[0].file.asset->_id, file.asset->_id),
    "url": coalesce(media[0].file.asset->url, file.asset->url),
    "width": coalesce(media[0].file.asset->metadata.dimensions.width, file.asset->metadata.dimensions.width),
    "height": coalesce(media[0].file.asset->metadata.dimensions.height, file.asset->metadata.dimensions.height),
    "altText": coalesce(media[0].altText, altText)
  }
}`;
