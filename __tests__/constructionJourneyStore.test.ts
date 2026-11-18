import {useConstructionJourneyStore} from '../src/store/constructionJourneyStore';

describe('construction plot location store mapping', () => {
  beforeEach(() => {
    useConstructionJourneyStore.setState(useConstructionJourneyStore.getInitialState());
  });

  it('commits master IDs and names to canonical location fields and preserves them through later journey steps', () => {
    const store = useConstructionJourneyStore.getState();
    store.setPlotLocation({state: 'Madhya Pradesh', stateId: 23, city: 'Indore', cityId: 451, area: 'Vijay Nagar', areaId: 8123, address: 'Plot address', landmark: ''});
    useConstructionJourneyStore.getState().setPropertyDetails({hasPlot: true, plotWidthFt: 30, plotLengthFt: 50, facing: 'East', isCornerPlot: false, location: 'Vijay Nagar, Indore'});
    useConstructionJourneyStore.getState().setHomeRequirements({buildType: 'Independent House', floors: 2, bedrooms: 3, builtUpPreference: 'Standard'});
    useConstructionJourneyStore.getState().setPreferences({quality: 'Premium', additionalPreferences: [], notes: ''});
    useConstructionJourneyStore.getState().setRequirementDraft();

    const state = useConstructionJourneyStore.getState();
    expect(state.locationStateId).toBe(23);
    expect(state.locationState).toBe('Madhya Pradesh');
    expect(state.locationCityId).toBe(451);
    expect(state.locationCity).toBe('Indore');
    expect(state.locationAreaId).toBe(8123);
    expect(state.locationArea).toBe('Vijay Nagar');
    expect(state).not.toHaveProperty('cityId');
    expect(state).not.toHaveProperty('areaId');
  });

  it('replaces a changed locality while preserving the selected state and city', () => {
    const store = useConstructionJourneyStore.getState();
    store.setPlotLocation({state: 'Madhya Pradesh', stateId: 23, city: 'Indore', cityId: 451, area: 'Vijay Nagar', areaId: 8123, address: 'Plot address', landmark: ''});
    useConstructionJourneyStore.getState().setPlotLocation({area: 'Palasia', areaId: 8124});

    const state = useConstructionJourneyStore.getState();
    expect(state.locationStateId).toBe(23);
    expect(state.locationCityId).toBe(451);
    expect(state.locationAreaId).toBe(8124);
    expect(state.locationArea).toBe('Palasia');
  });
});
