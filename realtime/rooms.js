module.exports = {
  mapRoom: mapId => `maps/${mapId}`,
  userMapRoom: (mapperId, mapId) => `mappers/${mapperId}/maps/${mapId}`,
  userRoom: mapperId => `mappers/${mapperId}`
}
