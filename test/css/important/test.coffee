describe 'css/important >>', ->
  beforeEach -> this.filename = __filename

  it '0', -> this.shouldBeOk()

  it 'c.0', -> this.shouldBeOk()

  it 's.0', -> this.shouldBeOk()
