clear: 
	sudo docker compose down \

start:
	sudo docker compose up --build \

clear-all:
	sudo docker compose down -v \

get-dump:
	docker exec -it mongo mongodump \
	--db mydatabase \
	--out /dump \

run-seed:
	sudo docker exec -it backend npm run seed
