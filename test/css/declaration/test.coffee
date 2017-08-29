describe 'css/declaration >>', ->

  it '0', -> this.shouldBeOk()
  it '1', -> this.shouldBeOk()
  it '2', -> this.shouldBeOk()

  it 'custom.property.1', -> this.shouldBeOk()
  it 'custom.property.2', -> this.shouldBeOk()
  it 'custom.property.3', -> this.shouldBeOk()
  it 'custom.property.4', -> this.shouldBeOk()
  it 'custom.property.5', -> this.shouldBeOk()
  it 'custom.property.6', -> this.shouldBeOk()

  it 'c.0', -> this.shouldBeOk()
  it 'c.1', -> this.shouldBeOk()
  it 'c.2', -> this.shouldBeOk()
  it 'c.3', -> this.shouldBeOk()

  it 'filter.0', -> this.shouldBeOk()
  it 'filter.1', -> this.shouldBeOk()
  it.skip 'filter.2', -> this.shouldBeOk()
  it 'filter.3', -> this.shouldBeOk()
  it 'filter.4', -> this.shouldBeOk()
  it 'filter.5', -> this.shouldBeOk()

  it 'filter.c.0', -> this.shouldBeOk()
  it 'filter.c.1', -> this.shouldBeOk()

  it 'filter.s.0', -> this.shouldBeOk()
  it 'filter.s.1', -> this.shouldBeOk()

  it 's.0', -> this.shouldBeOk()
  it 's.1', -> this.shouldBeOk()
  it 's.2', -> this.shouldBeOk()
  it 's.3', -> this.shouldBeOk()
