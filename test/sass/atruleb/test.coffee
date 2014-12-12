describe 'sass/atruleb >>', ->
  beforeEach -> this.filename = __filename

  it.skip '0', -> this.shouldBeOk()
  it.skip '1', -> this.shouldBeOk()
  it.skip '2', -> this.shouldBeOk()

  it.skip 'c.0', -> this.shouldBeOk()
  it.skip 'c.1', -> this.shouldBeOk()
  it.skip 'c.2', -> this.shouldBeOk()

  it.skip 's.0', -> this.shouldBeOk()
  it.skip 's.1', -> this.shouldBeOk()
  it.skip 's.2', -> this.shouldBeOk()
