-- FUNÇÃO PARA UPDATES

create or replace function public.person_notify_update_trigger() returns trigger as $$
declare 
begin 
	perform pg_notify( cast('update_notification' as text), row_to_json(new)::text);
	return new;
end;
$$ LANGUAGE plpgsql;

-- FUNÇÃO PARA INSERTS

create or replace function public.person_notify_insert_trigger() returns trigger as $$
declare 
begin 
	perform pg_notify( cast('insert_notification' as text), row_to_json(new)::text);
	return new;
end;
$$ LANGUAGE plpgsql;

-- TRIGGER PARA UPDATE

create trigger person_update_trigger after update on public.person
for each row execute procedure public.person_notify_update_trigger();

-- TRIGGER PARA INSERT

create trigger person_insert_trigger after insert on public.person
for each row execute procedure public.person_notify_insert_trigger();

-- INSERT PARA TEST

insert into person (first_name, last_name, email, company) values ('Ana', 'Weir', 'uweir0@spiegel.de', 'Wikizz');