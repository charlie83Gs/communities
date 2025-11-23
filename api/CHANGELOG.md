# Changelog

## [1.7.0](https://github.com/charlie83Gs/communities/compare/communities-api-v1.6.0...communities-api-v1.7.0) (2025-11-23)


### Features

* comprehensive community platform enhancements ([ced4e66](https://github.com/charlie83Gs/communities/commit/ced4e667ddd678e452ff23a1e327b6837da4a1d6))
* **disputes:** implement complete dispute resolution system ([#24](https://github.com/charlie83Gs/communities/issues/24)) ([22fd755](https://github.com/charlie83Gs/communities/commit/22fd7554b7a7cd5be8ce05a717ed86ec2022a1b0))

## [1.6.0](https://github.com/charlie83Gs/communities/compare/communities-api-v1.5.3...communities-api-v1.6.0) (2025-11-17)


### Features

* add multi-language support to items (EN, ES, HI) ([e2eabc6](https://github.com/charlie83Gs/communities/commit/e2eabc6f336ded901013c5a0494259c7aa9ef668))
* **api:** expand default items catalog from 60 to 400 items ([e27d5ad](https://github.com/charlie83Gs/communities/commit/e27d5ad9a8c93393a2acd373bfddb3228a6d6feb))
* **contributions:** FT-16 Community Value Recognition System ([#25](https://github.com/charlie83Gs/communities/issues/25)) ([83c4fe1](https://github.com/charlie83Gs/communities/commit/83c4fe1a6aa0a84d63ba28a760ad1c44eb64b67d))
* **items:** enable editing and deletion of default items ([2f5005c](https://github.com/charlie83Gs/communities/commit/2f5005c630461ef92aacbe14bb4b56c39169c28e))


### Bug Fixes

* **api:** flatten item translations to name/description in responses ([93c680c](https://github.com/charlie83Gs/communities/commit/93c680cba8b6d7e88ab13512d994e1b2831fb5e2))
* **api:** resolve all TypeScript compilation errors ([b4d125e](https://github.com/charlie83Gs/communities/commit/b4d125efe8e08781b83a2682e7cbb91584cf0346))
* **tests:** fix failing unit tests ([cb824b0](https://github.com/charlie83Gs/communities/commit/cb824b061ac83a1b64f45e9653396d8417232a38))
* **tests:** remove unused _result variables in test files ([81ce225](https://github.com/charlie83Gs/communities/commit/81ce2259dcacf6c7c7b8c44fc0270adb66bc2b4f))

## [1.5.3](https://github.com/charlie83Gs/communities/compare/communities-api-v1.5.2...communities-api-v1.5.3) (2025-11-12)


### Bug Fixes

* **api:** resolve all 59 failing unit tests ([c7459b6](https://github.com/charlie83Gs/communities/commit/c7459b6c04c4f4cb40644fa1d0aeef1e1487bc87))

## [1.5.2](https://github.com/charlie83Gs/communities/compare/communities-api-v1.5.1...communities-api-v1.5.2) (2025-11-12)


### Bug Fixes

* **api:** restore BASE_ROLES import that was incorrectly prefixed ([83fa2fe](https://github.com/charlie83Gs/communities/commit/83fa2fe068d16c5813b3a7110fbac68186603f61))

## [1.5.1](https://github.com/charlie83Gs/communities/compare/communities-api-v1.5.0...communities-api-v1.5.1) (2025-11-12)


### Bug Fixes

* **api:** resolve all ESLint warnings to enable clean CI builds ([4fda367](https://github.com/charlie83Gs/communities/commit/4fda367e3e8cfaf92e251a616cc2fa3c5b39377e))

## [1.5.0](https://github.com/charlie83Gs/communities/compare/communities-api-v1.4.1...communities-api-v1.5.0) (2025-11-12)


### Features

* **config:** implement database-backed runtime configuration system ([406f634](https://github.com/charlie83Gs/communities/commit/406f6341392fda16961a0e25fbf86a2f145af1e7))


### Bug Fixes

* **api:** replace == with === in wealth service lint error ([1b01ab8](https://github.com/charlie83Gs/communities/commit/1b01ab8cd38ffe12d5e6366c05ff20d9f3e29da7))
* **keycloak:** use 'communities-app' as client ID and consolidate clients ([967df3a](https://github.com/charlie83Gs/communities/commit/967df3ad92b6e47b29710d1cb915455819c7ceb2))

## [1.4.1](https://github.com/charlie83Gs/communities/compare/communities-api-v1.4.0...communities-api-v1.4.1) (2025-11-09)


### Bug Fixes

* **api:** skip OpenFGA migrations in production environment ([a0d8d59](https://github.com/charlie83Gs/communities/commit/a0d8d590b50f208830e641ae12a6c3bb837f5c95))

## [1.4.0](https://github.com/charlie83Gs/communities/compare/communities-api-v1.3.1...communities-api-v1.4.0) (2025-11-09)


### Features

* **api:** migrate all services to use OpenFGA repository pattern ([87dab2d](https://github.com/charlie83Gs/communities/commit/87dab2d8052829ef4b883aa2e09fdb9645bae653))
* implement pools, needs, councils, and community events systems ([cebeed1](https://github.com/charlie83Gs/communities/commit/cebeed1edf17e45a1060b7cda0f7f2fb017b9439))

## [1.3.1](https://github.com/charlie83Gs/communities/compare/communities-api-v1.3.0...communities-api-v1.3.1) (2025-11-07)


### Bug Fixes

* replace pg with postgres package in openfga-migrate ([de6a93a](https://github.com/charlie83Gs/communities/commit/de6a93a09357bb5ea1003dab2a9d91ce89f7957f))

## [1.3.0](https://github.com/charlie83Gs/communities/compare/communities-api-v1.2.0...communities-api-v1.3.0) (2025-11-07)


### Features

* increment, multiple features, ci, testing improvements ([aeb15ea](https://github.com/charlie83Gs/communities/commit/aeb15eaec5b9f9068bf9cb82638b2051167e276f))

## [1.2.0](https://github.com/charlie83Gs/communities/compare/communities-api-v1.1.0...communities-api-v1.2.0) (2025-11-06)


### Features

* add Kubernetes deployment manifests and release automation ([2fe3f36](https://github.com/charlie83Gs/communities/commit/2fe3f36eb192e01be124d7e05f19c6284972f272))
* **api:** add deployment configuration support ([9f3612c](https://github.com/charlie83Gs/communities/commit/9f3612c8a9c9bea307d3285c90dc9a816a54beeb))

## [1.1.0](https://github.com/charlie83Gs/communities/compare/communities-api-v1.0.0...communities-api-v1.1.0) (2025-11-06)


### Features

* Initial commit, it is still messy, but some features work and need to figure out the deployment ([59ea8ce](https://github.com/charlie83Gs/communities/commit/59ea8ce372ca14f3d9d47d59c82a0cd7a44bc84e))
