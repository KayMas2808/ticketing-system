package com.ticketing.system.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ticketing.system.entity.Priority;
import com.ticketing.system.entity.Status;
import com.ticketing.system.entity.Ticket;
import com.ticketing.system.entity.User;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByCreator(User creator);

    List<Ticket> findByAssignee(User assignee);

    List<Ticket> findByStatus(Status status);

    List<Ticket> findByPriority(Priority priority);

    List<Ticket> findByCreatorOrAssignee(User creator, User assignee);

    List<Ticket> findBySubjectContainingIgnoreCase(String subject);
}
